'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('logs', {
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
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        })
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.dropTable('logs');
    }
};
