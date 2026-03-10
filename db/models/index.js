import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { readdir } from 'node:fs/promises';
import { Sequelize } from 'sequelize';

const require = createRequire(import.meta.url);
const config = require(`../config.cjs`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV;
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

const db = {};

// Dynamically import all model files from this directory
const files = await readdir(__dirname);
const modelFiles = files.filter(
  (file) => file.endsWith(`.js`) && file !== basename(__filename),
);

for (const file of modelFiles) {
  const modelModule = await import(join(__dirname, file));
  const modelFn = modelModule.default;
  const model = modelFn(sequelize);
  db[model.name] = model;
}

// Run associations
for (const modelName of Object.keys(db)) {
  if (typeof db[modelName].associate === `function`) {
    db[modelName].associate(db);
  }
}

export { sequelize, Sequelize };
export const {
  User,
  Address,
  UserAttribute,
  Organization,
  OrganizationMember,
  Inquiry,
  Notification,
  Invitation,
  AuditLog,
  SentEmail,
  NoSendEmailAddress,
} = db;

export default db;
