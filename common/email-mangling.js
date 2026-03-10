const ENV = process.env.NEXT_PUBLIC_APP_ENV;
const IS_PRODUCTION = ENV === `production`;

/**
 * Trims and lowercases an email address.
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * React Hook Form rules for email fields.
 * Pairs with `validateEmail` — returns the validation error or `true` (pass).
 */
export const EMAIL_RULES = {
  required: `Email is required`,
  validate: (v) => validateEmail(v) || true,
};

/**
 * Mangles an email for the auth provider in non-production environments.
 * Inserts `+---{env}---` before the `@` so each environment gets its own
 * namespace in a shared auth provider tenant.
 *
 * Production emails pass through unchanged.
 *
 * @param {string} email - clean email (e.g. `bob@company.com`)
 * @returns {string} mangled email (e.g. `bob+---staging---@company.com`)
 */
export function toAuthProviderEmail(email) {
  if (IS_PRODUCTION) return email;

  const atIndex = email.lastIndexOf(`@`);
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  return `${local}+---${ENV}---${domain}`;
}

/**
 * Unmangles an email received from the auth provider.
 * Strips the `+---{env}---` suffix from the local part.
 *
 * Production emails pass through unchanged.
 *
 * @param {string} email - mangled email from auth provider
 * @returns {string} clean email for DB storage
 */
export function fromAuthProviderEmail(email) {
  if (IS_PRODUCTION) return email.toLowerCase();

  const suffix = `+---${ENV}---`;
  const atIndex = email.lastIndexOf(`@`);
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (local.endsWith(suffix)) {
    return (local.slice(0, -suffix.length) + domain).toLowerCase();
  }

  return email.toLowerCase();
}

/**
 * Validates an email address for format and rejects the `---` pattern
 * between `+` and `@` (which would collide with the mangling scheme).
 *
 * This check runs in ALL environments, including production.
 *
 * @param {string} email
 * @returns {string|null} error message, or null if valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== `string`) {
    return `Email is required`;
  }

  const trimmed = email.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `Enter a valid email address`;
  }

  const atIndex = trimmed.lastIndexOf(`@`);
  const local = trimmed.substring(0, atIndex);
  const plusIndex = local.indexOf(`+`);

  if (plusIndex >= 0) {
    const afterPlus = local.substring(plusIndex + 1);
    if (afterPlus.includes(`---`)) {
      return `Email address cannot contain "---" after the "+" character`;
    }
  }

  return null;
}
