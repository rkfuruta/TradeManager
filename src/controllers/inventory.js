const Inventory = require("../models/inventory.js");
const User = require("../models/user.js");
const moment = require("moment");
const empire = require("../api/empire.js");
const _ = require("underscore");
const InventoryItem = require("../models/inventory_item.js");
const { Op } = require("sequelize");
const {transactions} = require("./dashboard");
const Config = require("../models/config.js");

async function get(req, res) {
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    const params = req.query;
    try {
        let inventory = await createOrGetInventory(userId);

        if (params.hasOwnProperty("reload") && params.reload.includes("true")) {
            inventory = await updateInventory(inventory);
        } else {
            const updated = moment(inventory.updatedAt);
            const now = moment().subtract(30, 'minutes');
            if (updated.isBefore(now)) {
                inventory = await updateInventory(inventory);
            } else {
                await getItemsData(inventory);
            }
        }
        checkItems(inventory);
        return res.status(200).json({ success: true, data: {inventory}});
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message});
    }
}

async function inventoryUpdateCheck(userId) {
    let inventory = await createOrGetInventory(userId);
    inventory = await updateInventory(inventory);
    checkItems(inventory);
}

async function createOrGetInventory(userId) {
    let inventory = await Inventory.findOne({ where: { user_id: userId }});
    if (inventory) {
        return inventory;
    }
    return await Inventory.create({
        user_id: userId
    });
}

async function getItemsData(inventory) {
    let result = await InventoryItem.findAll( { where: { inventory_id: inventory.entity_id, sell_date: null }});
    let items = [];
    _.each(result, (item) => {
        items.push(item.dataValues);
    })
    inventory.dataValues.items = sortItems(items);
    return inventory;
}

async function updateInventory(inventory) {
    const user = await User.findOne({ where: { entity_id: inventory.user_id }});
    if (!user.empire_api_key) {
        throw new Error("Please inform your empire api key");
    }
    const result = await empire.getInventory(user.empire_api_key).catch((err) => {
        if (err.hasOwnProperty("response") && err.response.hasOwnProperty("data") && err.response.data.hasOwnProperty("message")) {
            throw new Error(err.response.data.message);
        }
        throw err;
    });
    const items = await saveItems(result.data.data, inventory);
    inventory.changed('updatedAt', true);
    inventory.save();
    inventory.dataValues.items = sortItems(items);
    return inventory;
}

function sortItems(items) {
    itemsPurchase = _.filter(items, item => item.purchase_value);
    others = _.filter(items, item => !item.purchase_value);
    itemsPurchase.sort((a, b) => {
        if (a.empire_created_at > b.empire_created_at) {
            return -1;
        } else if (a.empire_created_at < b.empire_created_at) {
            return 1;
        }
        return 0;
    })
    others.sort((a, b) => {
        if (a.empire_created_at > b.empire_created_at) {
            return -1;
        } else if (a.empire_created_at < b.empire_created_at) {
            return 1;
        }
        return 0;
    })
    return itemsPurchase.concat(others);
}

async function saveItems(data, inventory) {
    let upsert = [];
    let assetIds = [];
    _.each(data, (item) => {
        assetIds.push(item.asset_id);
        upsert.push(upsertItem(item, inventory));
    });
    let response = await InventoryItem.findAll(
        {
            where: {
                inventory_id: inventory.entity_id,
                asset_id: {
                    [Op.notIn]:assetIds
                },
                sell_date: {
                    [Op.eq]: null
                }
            }
        });
    let sold = [];
    _.each(response, item => sold.push(itemSold(item, inventory.user_id)));
    await Promise.all(sold);
    let result = await InventoryItem.findAll( { where: { inventory_id: inventory.entity_id, sell_date: null }});
    let items = [];
    _.each(result, (item) => {
        items.push(item.dataValues);
    })
    return items;
}

async function upsertItem(item, inventory) {
    let InvItem = await InventoryItem.findOne({ where : { inventory_id: inventory.entity_id, asset_id: item.asset_id }});
    let intItemData = {
        inventory_id: inventory.entity_id,
        asset_id: item.asset_id,
        empire_id: item.id,
        market_name: item.market_name,
        icon_url: item.icon_url,
        tradable: item.tradable,
        wear: item.wear,
        market_value: item.market_value,
        empire_created_at: moment.utc(item.created_at, "YYYY-MM-DD HH:mm:ss").toISOString()
    }
    if (item.tradelock) {
        intItemData.tradelock = moment.unix(item.tradelock.timestamp).toISOString();
    }
    if (!InvItem) {
        InvItem = await InventoryItem.create(intItemData);
    } else {
        InvItem = await InventoryItem.update(intItemData, {
            where: {
                entity_id: InvItem.entity_id
            }
        });
    }
}

async function checkItems(inventory) {
    _.each(inventory.dataValues.items, (item) => {
        setPurchaseData(item, inventory.user_id);
        checkTradeLock(item, inventory.user_id);
    });
}

async function checkTradeLock(item, user_id) {
    const now = moment();
    const tradelock = moment(item.tradelock);

    if (now.isAfter(tradelock)) {
        await InventoryItem.update({
                tradable: true,
                tradelock: null
            },
            {
                where: { entity_id: item.entity_id }
            }
        );
        await depositItem(item, user_id);
    }
}

async function depositItem(item, user_id) {
    if (item.status !== 0) {
        return null;
    }
    if (!item.purchase_value) {
        return null;
    }
    let result = await Config.findOne({ where: { user_id: user_id, code: "auto_deposit_items" } });
    if (!result || result.dataValues.value !== "true") {
        return null;
    }
    const user = await User.findOne({ where: { entity_id: user_id}});
    if (!user.empire_api_key) {
        return null;
    }
    const price = (item.market_value > item.purchase_value)? item.market_value : item.purchase_value;
    result = await Config.findOne({ where: { user_id: user_id, code: "profit_percent" } });
    if (!result) {
        return null;
    }
    const profit_percent = result.dataValues.value;
    let deposit_value = Math.ceil((price*profit_percent/100)+price);
    result = await empire.getCheapestItem(item.market_name, user.empire_api_key);
    if (result && result.data.data.length) {
        let cheapestListing = result.data.data.shift();
        let marketPrice = Math.floor(cheapestListing.market_value - (cheapestListing.market_value/100));
        if (deposit_value < marketPrice) {
            deposit_value = marketPrice;
        }
    }
    if (deposit_value < item.market_value || deposit_value < item.purchase_value) {
        return null;
    }
    await empire.depositItem(item.empire_id, deposit_value, user.empire_api_key);
}

async function setPurchaseData(item, user_id) {
    if (item.withdraw_id || !item.withdraw_check) {
        return item;
    }
    const user = await User.findOne({ where: { entity_id: user_id}});
    if (!user.empire_api_key) {
        throw new Error("Please inform your empire api key");
    }
    let result = await empire.getWithdrawals(user.empire_api_key);
    const withdraw = await findWithdrawal(result.data.data.withdrawals, item);
    if (withdraw) {
        InventoryItem.update(
            {
                withdraw_id: withdraw.id,
                purchase_value: withdraw.total_value,
                purchase_date: moment.unix(withdraw.metadata.auction_ends_at).toISOString(),
                withdraw_check: false
            },
            {
                where: {
                    entity_id: item.entity_id
                }
            }
        );
    } else {
        InventoryItem.update({ withdraw_check: false }, { where: { entity_id: item.entity_id } });
    }
}

async function findWithdrawal(withdraws, item) {
    for (let i = 0; i < withdraws.length; i++) {
        if (item.market_name === withdraws[i].item.market_name && withdraws[i].status === 6) {
            let response = await InventoryItem.findOne({where: {withdraw_id: withdraws[i].id}});
            if (!response) {
                return withdraws[i];
            }
        }
    }
    return false;
}

async function itemSold(item, user_id) {
    const user = await User.findOne({ where: { entity_id: user_id }});
    if (!user.empire_api_key) {
        throw new Error("Please inform your empire api key");
    }
    let result = await empire.getDeposits(user.empire_api_key);
    if (result.data.success) {
        let update = []
        _.each(result.data.data.deposits, async (deposit) => {
            if (item.asset_id === deposit.item.asset_id && deposit.status === 6) {
                let sell_date = moment.unix(deposit.metadata.expires_at).subtract(12, "hours");
                update.push(InventoryItem.update(
                    {
                        sell_value: deposit.total_value,
                        sell_date:sell_date.toISOString(),
                    },
                    {
                        where:
                            {
                                entity_id: item.entity_id
                            }
                    }
                ));
            }
        });
        await Promise.all(update);
        if (update.length === 0) {
            await InventoryItem.update(
                {
                    sell_date: moment().toISOString()
                },
                {
                    where:
                        {
                            entity_id: item.entity_id
                        }
                }
            );
        }
    }
}

module.exports = {
    get,
    inventoryUpdateCheck
}