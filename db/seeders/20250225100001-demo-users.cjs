'use strict';

const ADMIN_USER_ID = '11111111-1111-1111-1111-111111111111';
const REGULAR_USER_ID = '22222222-2222-2222-2222-222222222222';
const ORG_OWNER_ID = '33333333-3333-3333-3333-333333333333';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('User', [
      {
        id: ADMIN_USER_ID,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isAdmin: true,
        externalAuthId: 'auth0|admin1',
        externalAuthProvider: 'auth0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: REGULAR_USER_ID,
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        isActive: true,
        isAdmin: false,
        externalAuthId: 'auth0|user2',
        externalAuthProvider: 'auth0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ORG_OWNER_ID,
        email: 'owner@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        isActive: true,
        isAdmin: false,
        externalAuthId: 'auth0|owner3',
        externalAuthProvider: 'auth0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('User', null, {});
  },
};
