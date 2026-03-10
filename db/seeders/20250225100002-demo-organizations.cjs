'use strict';

const ORG_OWNER_ID = '33333333-3333-3333-3333-333333333333';
const ACME_CORP_ID = 'aaaa1111-aaaa-1111-aaaa-111111111111';
const STARTUP_INC_ID = 'aaaa2222-aaaa-2222-aaaa-222222222222';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Organization', [
      {
        id: ACME_CORP_ID,
        ownerId: ORG_OWNER_ID,
        name: 'Acme Corp',
        slug: 'acme-corp',
        description: 'A sample organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: STARTUP_INC_ID,
        ownerId: ORG_OWNER_ID,
        name: 'Startup Inc',
        slug: 'startup-inc',
        description: 'Another sample organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Organization', null, {});
  },
};
