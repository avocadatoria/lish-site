import crypto from 'node:crypto';

/**
 * Test data factories.
 * Each returns a plain object with sensible defaults, overridable via the
 * `overrides` parameter.
 */

/**
 * Create an address-like data object.
 * @param {object} [overrides]
 * @returns {object}
 */
export function createAddressData(overrides = {}) {
  return {
    id: crypto.randomUUID(),
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
