const Sequelize =  require("sequelize");
const db = require("../db.js");

module.exports = db.define("user", {
    entity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    empire_api_key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    steam_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    }
})