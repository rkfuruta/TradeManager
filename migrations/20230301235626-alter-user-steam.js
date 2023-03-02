'use strict';

const Sequelize = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'steam_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'steam_id');
    }
};
