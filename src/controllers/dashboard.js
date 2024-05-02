const moment = require("moment");
const Inventory = require("../models/inventory.js");
const InventoryItem = require("../models/inventory_item.js");
const { Op } = require("sequelize");
const db = require("../db.js");

async function transactions(req, res) {
    if (!req.query.month || !req.query.year) {
        return res.status(400).json({ success: false, message: "Params 'month' and 'year' are required"});
    }
    const tokenData = req.token_data;
    const userId = tokenData.user_id;
    let start = moment.utc(`${req.query.month}/${req.query.year}`,"MM/YYYY").startOf('month');
    let end = moment.utc(`${req.query.month}/${req.query.year}`,"MM/YYYY").endOf('month');
    let inventory = await Inventory.findOne({ where: { user_id: userId }});
    if (!inventory) {
        return res.status(200).json({ success: false, message: "No data available"});
    }
    let items = await InventoryItem.findAll({
        where: {
            inventory_id: inventory.entity_id,
            purchase_date: { [Op.between]: [start.toISOString(), end.toISOString()] }
        },
        order: [ ["purchase_date", "DESC"] ]
    });
    return res.status(200).json({ success: true, data: {items}});
}
async function transactionDates(req, res) {
    const [results, metadata] = await db.query("SELECT DISTINCT YEAR(purchase_date) AS Year, MONTH(purchase_date) AS Month FROM inventory_items WHERE purchase_date IS NOT NULL ORDER BY Year DESC, Month DESC LIMIT 12");
    return res.status(200).json({ success: true, data: {results}});
}

module.exports = {
    transactions,
    transactionDates
}