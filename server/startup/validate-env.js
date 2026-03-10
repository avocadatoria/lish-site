import { validateEnvSchema, validateEnvFileQuoting, validateEnvCrossRules } from '../../common/env.js';
import { createLogger } from '../../common/logger.js';

const log = createLogger(`startup:env`);

export async function validateEnv() {
  log.info(`Validating environment variables...`);

  // 1. Check .env file quoting (if file exists)
  validateEnvFileQuoting(`.env`);
  log.info(`.env file quoting check passed`);

  // 2. Zod schema validation
  validateEnvSchema();
  log.info(`Environment schema validation passed`);

  // 3. Cross-env rules
  validateEnvCrossRules(process.env);
  log.info(`Environment cross-validation passed`);
}
