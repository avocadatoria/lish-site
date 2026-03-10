import { createLogger } from '../../common/logger.js';
import { validateEnv } from './validate-env.js';
import { validateDb } from './validate-db.js';
import { validateModels } from './validate-models.js';
import { validateServices } from './validate-services.js';

const log = createLogger(`startup`);

/**
 * Run all startup validations in order:
 * 1. env (fatal)
 * 2. db connection (fatal)
 * 3. model-schema match (fatal)
 * 4. external services (warnings only)
 */
export async function runStartupValidation(sequelize) {
  log.info(`Starting validation sequence...`);

  // Fatal validations
  await validateEnv();
  await validateDb(sequelize);
  await validateModels(sequelize);

  // Non-fatal service checks
  await validateServices();

  log.info(`All startup validations complete`);
}
