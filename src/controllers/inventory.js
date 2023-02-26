const Inventory = require("../models/inventory.js");
const User = require("../models/user.js");
const moment = require("moment");
const empire = require("../api/empire.js");
const _ = require("underscore");
const InventoryItem = require("../models/inventory_item.js");
const { Op } = require("sequelize");
const {getTransaction} = require("../api/empire");
const {transactions} = require("./dashboard");

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
    let result = await InventoryItem.findAll( { where: { inventory_id: inventory.entity_id }});
    let items = [];
    _.each(result, (item) => {
        items.push(item.dataValues);
    })
    inventory.dataValues.items = items;
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
        setPurchaseData(item, inventory.user_id)
    });
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
    let found = false;
    await _.each(result.data.data.withdrawals, async (withdraw) => {
        if (item.market_name === withdraw.item.market_name && withdraw.status === 6) {
            let response = await InventoryItem.findOne({ where: { withdraw_id: withdraw.id } });
            if (!response) {
                found = true;
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
            }
        }
    });
    if (!found) {
        InventoryItem.update({ withdraw_check: false }, { where: { entity_id: item.entity_id } });
    }
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
                let transaction = await getTransactionByItemId(item.empire_id, user.empire_api_key);
                let sell_date = Math.floor(transaction.timestamp_raw/1000) || moment.utc().unix();
                update.push(InventoryItem.update(
                    {
                        sell_value: deposit.total_value,
                        sell_date:moment.unix(sell_date).toISOString(),
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
    }
}

async function getTransactionByItemId(empire_id, token) {
    let page = 1;
    let total_pages = 1;
    let transactionData = null;
    while(page <= total_pages) {
        let result = await empire.getTransaction(page, token);
        total_pages = result.data.last_page;
        _.each(result.data.data, (transaction) => {
            if (transaction.data.status === 300 && transaction.data.metadata.item_id === empire_id) {
                transactionData = transaction;
            }
        });
        if (transactionData) {
            total_pages = 0;
        }
    }
    return transactionData;
}

module.exports = {
    get,
    inventoryUpdateCheck
}