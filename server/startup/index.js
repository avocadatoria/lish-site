import { createLogger } from '../../common/logger.js';
import { validateEnv } from './validate-env.js';
import { validateServices } from './validate-services.js';

const log = createLogger(`startup`);

/**
 * Run all startup validations in order:
 * 1. env (fatal)
 * 2. external services (warnings only)
 */
export async function runStartupValidation() {
  log.info(`Starting validation sequence...`);

  await validateEnv();
  await validateServices();

  log.info(`All startup validations complete`);
}
