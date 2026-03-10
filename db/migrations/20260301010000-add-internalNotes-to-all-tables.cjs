'use strict';

const tables = [
  'User',
  'Address',
  'UserAttribute',
  'Organization',
  'OrganizationMember',
  'Inquiry',
  'Notification',
  'Invitation',
  'AuditLog',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of tables) {
      await queryInterface.addColumn(table, 'internalNotes', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'internalNotes');
    }
  },
};
