'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Normalize existing emails to lowercase before adding the constraint
    await queryInterface.sequelize.query(
      `UPDATE "User" SET email = LOWER(email) WHERE email != LOWER(email)`,
    );

    // Drop the existing case-sensitive unique constraint on email
    // (Sequelize creates it as a constraint, not just an index)
    await queryInterface.removeConstraint('User', 'User_email_key');

    // Add a case-insensitive unique index — only among non-deleted rows
    // so soft-deleted users don't block new signups with the same email
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX "user_email_lower_unique" ON "User" (LOWER(email)) WHERE "deletedAt" IS NULL`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS "user_email_lower_unique"`,
    );

    await queryInterface.addConstraint('User', {
      fields: ['email'],
      type: 'unique',
      name: 'User_email_key',
    });
  },
};
