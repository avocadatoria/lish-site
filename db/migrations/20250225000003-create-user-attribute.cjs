'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserAttribute', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'User', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      intValue: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      booleanValue: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      strValue: {
        type: Sequelize.STRING(256),
        allowNull: true,
      },
      dateValue: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      textValue: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('UserAttribute', ['userId', 'key'], { unique: true });
    await queryInterface.addIndex('UserAttribute', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserAttribute');
  },
};
