'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('User', 'authProviderCode', 'authType');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('User', 'authType', 'authProviderCode');
  },
};
