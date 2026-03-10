'use strict';

const REGULAR_USER_ID = '22222222-2222-2222-2222-222222222222';
const ORG_OWNER_ID = '33333333-3333-3333-3333-333333333333';

const ADDRESS_1_ID = 'cccc1111-cccc-1111-cccc-111111111111';
const ADDRESS_2_ID = 'cccc2222-cccc-2222-cccc-222222222222';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Address', [
      {
        id: ADDRESS_1_ID,
        userId: REGULAR_USER_ID,
        type: 'home',
        street: '123 Elm Street',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ADDRESS_2_ID,
        userId: ORG_OWNER_ID,
        type: 'work',
        street: '456 Corporate Blvd',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        country: 'US',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Address', null, {});
  },
};
