const MIN_LENGTH = 12;
const MAX_LENGTH = 128;
const MAX_REPEATED = 3;
const MAX_SEQUENTIAL = 4;
const MIN_KEYBOARD_PATTERN = 5;

const KEYBOARD_ROWS = [
  `qwertyuiop`,
  `asdfghjkl`,
  `zxcvbnm`,
];

export const PASSWORD_REQUIREMENTS = [
  `At least ${MIN_LENGTH} characters`,
  `At least one letter and one number`,
  `No spaces or whitespace`,
  `No more than ${MAX_REPEATED} identical characters in a row`,
  `No sequential characters longer than ${MAX_SEQUENTIAL} (e.g. 12345, abcde)`,
  `No common keyboard patterns (e.g. qwerty)`,
  `Cannot contain parts of your email address`,
];

/**
 * Validates a password against all rules.
 *
 * @param {string} password
 * @param {string} [email] - used to check for email-part inclusion
 * @returns {string[]} Array of error messages (empty = valid)
 */
export function validatePassword(password, email) {
  const errors = [];

  if (!password) {
    errors.push(`Password is required`);
    return errors;
  }

  if (password.length < MIN_LENGTH) {
    errors.push(`Must be at least ${MIN_LENGTH} characters`);
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Must be no more than ${MAX_LENGTH} characters`);
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push(`Must contain at least one letter`);
  }

  if (!/\d/.test(password)) {
    errors.push(`Must contain at least one number`);
  }

  if (/\s/.test(password)) {
    errors.push(`Must not contain spaces or whitespace`);
  }

  if (hasLongRepeat(password, MAX_REPEATED)) {
    errors.push(`Must not repeat the same character more than ${MAX_REPEATED} times in a row`);
  }

  if (hasLongSequence(password, MAX_SEQUENTIAL)) {
    errors.push(`Must not contain sequential characters longer than ${MAX_SEQUENTIAL}`);
  }

  if (hasKeyboardPattern(password, MIN_KEYBOARD_PATTERN)) {
    errors.push(`Must not contain common keyboard patterns`);
  }

  if (email && hasEmailParts(password, email)) {
    errors.push(`Must not contain parts of your email address`);
  }

  return errors;
}

// ── Internal helpers ────────────────────────────

/**
 * Checks for runs of the same character longer than `max`.
 * e.g. max=3 means "aaa" is ok but "aaaa" fails.
 */
function hasLongRepeat(password, max) {
  const regex = new RegExp(`(.)\\1{${max},}`);
  return regex.test(password);
}

/**
 * Checks for ascending or descending sequences of consecutive char codes
 * longer than `max`. Case-insensitive.
 * e.g. max=4 means "abcd" is ok but "abcde" fails.
 */
function hasLongSequence(password, max) {
  const lower = password.toLowerCase();
  let asc = 1;
  let desc = 1;

  for (let i = 1; i < lower.length; i++) {
    const diff = lower.charCodeAt(i) - lower.charCodeAt(i - 1);

    if (diff === 1) {
      asc++;
      desc = 1;
    } else if (diff === -1) {
      desc++;
      asc = 1;
    } else {
      asc = 1;
      desc = 1;
    }

    if (asc > max || desc > max) return true;
  }

  return false;
}

/**
 * Checks if the password contains a substring of `minLen` or more
 * consecutive characters from a keyboard row (forward or reversed).
 */
function hasKeyboardPattern(password, minLen) {
  const lower = password.toLowerCase();

  for (const row of KEYBOARD_ROWS) {
    const reversed = [...row].reverse().join(``);

    for (const pattern of [row, reversed]) {
      for (let i = 0; i <= pattern.length - minLen; i++) {
        if (lower.includes(pattern.substring(i, i + minLen))) return true;
      }
    }
  }

  return false;
}

/**
 * Checks if the password contains any segment from the email address.
 * Splits the local part on common separators and the domain (minus TLD) on dots.
 * Only checks segments that are 3+ chars to avoid false positives.
 */
function hasEmailParts(password, email) {
  const lower = password.toLowerCase();
  const parts = getEmailParts(email);

  for (const part of parts) {
    if (lower.includes(part)) return true;
  }

  return false;
}

function getEmailParts(email) {
  const parts = [];
  const atIndex = email.indexOf(`@`);
  if (atIndex < 0) return parts;

  const local = email.substring(0, atIndex).toLowerCase();
  const domain = email.substring(atIndex + 1).toLowerCase();

  // Split local part on common separators
  for (const segment of local.split(/[._+\-]/)) {
    if (segment.length >= 3) parts.push(segment);
  }

  // Split domain, exclude TLD (last segment)
  const domainParts = domain.split(`.`);
  domainParts.pop();
  for (const segment of domainParts) {
    if (segment.length >= 3) parts.push(segment);
  }

  return parts;
}
