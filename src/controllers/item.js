const InventoryItem = require("../models/inventory_item.js");

async function status(req, res) {
    let item = await InventoryItem.findOne({ where: { entity_id: req.params.id }});
    if (!item) {
        return res.status(400).json({ success: false, message: "Item not found"});
    }
    if (!req.body.hasOwnProperty("status")) {
        return res.status(400).json({ success: false, message: "Item status is required"});
    }
    let data = item.dataValues;
    data.status = req.body.status;
    await InventoryItem.update(data, {
        where: {
            entity_id: item.dataValues.entity_id
        }
    });
    item = await InventoryItem.findOne({ where: { entity_id: req.params.id }});
    return res.status(200).json({ success: true, data: {item}});
}

module.exports = {
    status
}