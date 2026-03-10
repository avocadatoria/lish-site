'use strict';

const ADMIN_USER_ID = '11111111-1111-1111-1111-111111111111';
const REGULAR_USER_ID = '22222222-2222-2222-2222-222222222222';
const ORG_OWNER_ID = '33333333-3333-3333-3333-333333333333';
const ACME_CORP_ID = 'aaaa1111-aaaa-1111-aaaa-111111111111';
const STARTUP_INC_ID = 'aaaa2222-aaaa-2222-aaaa-222222222222';

const MEMBER_1_ID = 'bbbb1111-bbbb-1111-bbbb-111111111111';
const MEMBER_2_ID = 'bbbb2222-bbbb-2222-bbbb-222222222222';
const MEMBER_3_ID = 'bbbb3333-bbbb-3333-bbbb-333333333333';
const MEMBER_4_ID = 'bbbb4444-bbbb-4444-bbbb-444444444444';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('OrganizationMember', [
      {
        id: MEMBER_1_ID,
        organizationId: ACME_CORP_ID,
        userId: ORG_OWNER_ID,
        role: 'owner',
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: MEMBER_2_ID,
        organizationId: ACME_CORP_ID,
        userId: REGULAR_USER_ID,
        role: 'member',
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: MEMBER_3_ID,
        organizationId: ACME_CORP_ID,
        userId: ADMIN_USER_ID,
        role: 'admin',
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: MEMBER_4_ID,
        organizationId: STARTUP_INC_ID,
        userId: ORG_OWNER_ID,
        role: 'owner',
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrganizationMember', null, {});
  },
};
