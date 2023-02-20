const db = require("../db");
const Sequelize = require("sequelize");
const Inventory = require("./inventory");

const InventoryItem = db.define("inventory_item", {
    entity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    inventory_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    },
    asset_id: {
        type: Sequelize.DOUBLE.UNSIGNED,
        allowNull: false,
    },
    empire_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    },
    market_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    icon_url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tradable: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    tradelock: {
        type: Sequelize.DATE,
        allowNull: true
    },
    wear: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    market_value: {
        type: Sequelize.FLOAT,
        allowNull: true
    }
}, {
    charset: 'utf8',
    collate: 'utf8_general_ci'
});
InventoryItem.belongsTo(Inventory, {
    foreignKey: {
        name: "inventory_id"
    },
    onDelete: 'cascade'
});
module.exports = InventoryItem;