import { createRequire } from 'node:module';
import { Sequelize } from 'sequelize';

const require = createRequire(import.meta.url);
const config = require(`../../db/config.cjs`);

/**
 * Create a Sequelize instance using the test configuration.
 * @returns {Sequelize}
 */
export function setupTestDb() {
  const testConfig = config.test;
  return new Sequelize(
    testConfig.database,
    testConfig.username,
    testConfig.password,
    testConfig,
  );
}

/**
 * Truncate all tables in the database.
 * Uses TRUNCATE ... CASCADE to handle foreign key constraints.
 * @param {Sequelize} sequelize
 */
export async function cleanDb(sequelize) {
  const models = Object.values(sequelize.models);

  // Disable foreign key checks and truncate all tables
  await sequelize.query(`SET session_replication_role = replica;`);

  for (const model of models) {
    await model.destroy({ where: {}, force: true, truncate: true });
  }

  await sequelize.query(`SET session_replication_role = DEFAULT;`);
}

/**
 * Close the database connection.
 * @param {Sequelize} sequelize
 */
export async function closeDb(sequelize) {
  await sequelize.close();
}
