import { createLogger } from '../../common/logger.js';

const log = createLogger(`startup:models`);

/**
 * Compare model attributes against actual DB columns.
 * Catches drift between model definitions and migrations.
 */
export async function validateModels(sequelize) {
  log.info(`Validating model-schema alignment...`);

  const queryInterface = sequelize.getQueryInterface();
  const models = sequelize.models;
  const errors = [];

  for (const [name, model] of Object.entries(models)) {
    try {
      const tableDescription = await queryInterface.describeTable(model.tableName);
      const modelAttributes = Object.keys(model.rawAttributes);

      for (const attr of modelAttributes) {
        const field = model.rawAttributes[attr].field || attr;
        if (!tableDescription[field]) {
          errors.push(`Model "${name}" defines column "${field}" but it does not exist in table "${model.tableName}"`);
        }
      }
    } catch (err) {
      if (err.message?.includes(`does not exist`) || err.original?.code === `42P01`) {
        errors.push(`Table "${model.tableName}" for model "${name}" does not exist — run migrations`);
      } else {
        throw err;
      }
    }
  }

  if (errors.length > 0) {
    const msg = `Model-schema validation failed:\n${errors.map((e) => `  ${e}`).join(`\n`)}`;
    log.fatal(msg);
    throw new Error(msg);
  }

  log.info(`All ${Object.keys(models).length} models validated against database`);
}
