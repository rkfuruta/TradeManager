const Sequelize =  require("sequelize");
const db = require("../db.js");
const User = require("./user.js");

const Inventory = db.define("inventory", {
    entity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
    }
});
Inventory.belongsTo(User, {
    foreignKey: {
        name: "user_id"
    },
    onDelete: 'cascade'
});
module.exports = Inventory;