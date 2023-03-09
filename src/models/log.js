const Sequelize =  require("sequelize");
const db = require("../db.js");

const Log = db.define("log", {
    entity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Message"
    },
    priority: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    is_debug: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});
module.exports = Log;