import crypto from 'node:crypto';

/**
 * Test data factories.
 * Each returns a plain object with sensible defaults, overridable via the
 * `overrides` parameter.
 */

/**
 * Create a user-like data object.
 * @param {object} [overrides]
 * @returns {object}
 */
export function createUserData(overrides = {}) {
  const id = crypto.randomUUID();
  return {
    id,
    email: `user-${id.slice(0, 8)}@example.com`,
    firstName: `Test`,
    lastName: `User`,
    externalAuthId: `auth0|${id}`,
    externalAuthProvider: `auth0`,
    profileImage: null,
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    isAdmin: false,
    stripeCustomerId: null,
    ...overrides,
  };
}

/**
 * Create an organization-like data object.
 * @param {object} [overrides]
 * @returns {object}
 */
export function createOrgData(overrides = {}) {
  const id = crypto.randomUUID();
  const slug = `org-${id.slice(0, 8)}`;
  return {
    id,
    name: `Test Organization ${slug}`,
    slug,
    description: `A test organization`,
    website: `https://example.com`,
    logo: null,
    ownerId: crypto.randomUUID(),
    ...overrides,
  };
}

/**
 * Create an address-like data object.
 * @param {object} [overrides]
 * @returns {object}
 */
export function createAddressData(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: `home`,
    street: `123 Test Street`,
    city: `Testville`,
    state: `TS`,
    postalCode: `12345`,
    country: `US`,
    isDefault: false,
    ...overrides,
  };
}
