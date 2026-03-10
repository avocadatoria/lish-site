/**
 * Auth provider configuration.
 *
 * To remove a provider from a client project, delete its entry.
 * To add one, add a new entry with the Auth0 connection name.
 *
 * The `connection` value must match the connection name configured in Auth0.
 * The `icon` value is the filename in /public/icons/auth/ (SVG).
 */
export const AUTH_PROVIDERS = [
  { id: `google`,    label: `Google`,    connection: `google-oauth2`, icon: `google.svg` },
  { id: `github`,    label: `GitHub`,    connection: `github`,        icon: `github.svg` },
  { id: `apple`,     label: `Apple`,     connection: `apple`,         icon: `apple.svg` },
  { id: `linkedin`,  label: `LinkedIn`,   connection: `linkedin`,      icon: `linkedin.svg` },
  { id: `microsoft`, label: `Microsoft`, connection: `windowslive`,   icon: `microsoft.svg` },
];

/**
 * Returns a user-friendly label for an auth provider code.
 *
 * @param {string} code - provider code (e.g. `google`, `password`)
 * @returns {string} display label (e.g. `Google`, `email and password`)
 */
export function authProviderLabel(code) {
  if (code === `password`) return `email and password`;
  const match = AUTH_PROVIDERS.find((p) => p.id === code);
  return match ? match.label : code;
}

/**
 * Whether email OTP (passwordless) is enabled.
 * Set to false to remove OTP from a client project.
 */
export const EMAIL_OTP_ENABLED = true;
