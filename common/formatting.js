// ─────────────────────────────────────────────
// Date, currency, and string utilities
// ─────────────────────────────────────────────

/**
 * Format a date to a locale-friendly string.
 * @param {Date|string|number} date
 * @param {Object} [opts] - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, opts = {}) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(`en-US`, {
    year: `numeric`,
    month: `short`,
    day: `numeric`,
    ...opts,
  }).format(d);
}

/**
 * Format a date with time.
 */
export function formatDateTime(date, opts = {}) {
  return formatDate(date, {
    hour: `numeric`,
    minute: `2-digit`,
    ...opts,
  });
}

/**
 * Format cents to a currency string.
 * @param {number} cents
 * @param {string} [currency={`USD`}]
 * @returns {string}
 */
export function formatCurrency(cents, currency = `USD`) {
  return new Intl.NumberFormat(`en-US`, {
    style: `currency`,
    currency,
  }).format(cents / 100);
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + `\u2026`;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ``)
    .replace(/[\s_]+/g, `-`)
    .replace(/-+/g, `-`)
    .replace(/^-|-$/g, ``);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
  if (!str) return ``;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
