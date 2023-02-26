const Inventory = require('../controllers/inventory.js');
const Config = require("../models/config.js");
const _ = require("underscore");

Config.findAll({ where: { code: "automatic_inventory_update", value: "true" } }).then((result) => {
    _.each(result, (config) => {
        Inventory.inventoryUpdateCheck(config.user_id);
    });
});