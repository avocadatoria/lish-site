'use strict';

const REGULAR_USER_ID = '22222222-2222-2222-2222-222222222222';
const ORG_OWNER_ID = '33333333-3333-3333-3333-333333333333';

const ATTR_1_ID = 'dddd1111-dddd-1111-dddd-111111111111';
const ATTR_2_ID = 'dddd2222-dddd-2222-dddd-222222222222';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserAttribute', [
      {
        id: ATTR_1_ID,
        userId: REGULAR_USER_ID,
        key: 'timezone',
        strValue: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ATTR_2_ID,
        userId: ORG_OWNER_ID,
        key: 'notificationsEnabled',
        booleanValue: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserAttribute', null, {});
  },
};
