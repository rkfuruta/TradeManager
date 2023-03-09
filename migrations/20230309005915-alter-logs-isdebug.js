'use strict';

const Sequelize = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('logs', 'is_debug', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('logs', 'is_debug');
    }
};
