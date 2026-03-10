import { createLogger } from '../../common/logger.js';

const log = createLogger(`startup:db`);

export async function validateDb(sequelize) {
  log.info(`Testing database connection...`);

  try {
    await sequelize.authenticate();
    log.info(`Database connection established`);
  } catch (err) {
    log.fatal({ err }, `Unable to connect to database`);
    throw err;
  }
}
