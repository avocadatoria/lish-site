import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum([`development`, `production`, `test`]),
  NEXT_PUBLIC_APP_ENV: z.string().min(1),
  APP_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive(),
  API_URL: z.string().url(),
  LOG_LEVEL: z.enum([`fatal`, `error`, `warn`, `info`, `debug`, `trace`]),

  // Email
  NONPROD_EMAIL_SUBJECT_PREFIX: z.string(),
  ENABLE_MAIL: z.enum([`true`, `false`]),

  // AWS
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_SES_FROM_EMAIL: z.string().min(1),

  // Strapi (primary CMS)
  STRAPI_URL: z.string().url(),
  STRAPI_API_TOKEN: z.string().min(1),

  // Contact Form
  CONTACT_US_RECIPIENT: z.string().email(),

  // MUI
  NEXT_PUBLIC_MUI_LICENSE_KEY: z.string().optional(),
});

export function validateEnvSchema() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  ${i.path.join(`.`)}: ${i.message}`
    );
    throw new Error(
      `Environment validation failed:\n${issues.join(`\n`)}`
    );
  }
}

/**
 * Validates that all values in the .env file are quoted.
 * Reads the raw file and checks for unquoted values.
 */
export function validateEnvFileQuoting(filePath) {
  let content;
  try {
    content = readFileSync(resolve(filePath), `utf-8`);
  } catch {
    // No .env file — skip quoting check (env vars may come from environment)
    return;
  }

  const errors = [];
  const lines = content.split(`\n`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith(`#`)) continue;

    const eqIndex = line.indexOf(`=`);
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();

    // Value must be wrapped in double quotes
    if (value && !(value.startsWith(`"`) && value.endsWith(`"`))) {
      errors.push(`  Line ${i + 1}: ${key} — value must be quoted (e.g. ${key}="${value}")`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `.env file has unquoted values:\n${errors.join(`\n`)}`
    );
  }
}

/**
 * Cross-env validation rules that go beyond type checking.
 */
export function validateEnvCrossRules(env) {
  const errors = [];

  if (env.NODE_ENV === `production` && env.NONPROD_EMAIL_SUBJECT_PREFIX !== ``) {
    errors.push(`NONPROD_EMAIL_SUBJECT_PREFIX must be empty in production`);
  }

  if (env.NODE_ENV !== `production` && env.NONPROD_EMAIL_SUBJECT_PREFIX === ``) {
    errors.push(`NONPROD_EMAIL_SUBJECT_PREFIX must NOT be empty in non-production environments`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment cross-validation failed:\n${errors.map((e) => `  ${e}`).join(`\n`)}`
    );
  }
}
