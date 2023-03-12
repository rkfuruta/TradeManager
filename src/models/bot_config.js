const Sequelize =  require("sequelize");
const db = require("../db.js");

const BotConfig = db.define("bot_config", {
    entity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    json: {
        type: Sequelize.JSON,
        allowNull: true
    }
});
module.exports = BotConfig;