// ─────────────────────────────────────────────
// Auth levels
// ─────────────────────────────────────────────
export const AUTH_LEVELS = {
  PUBLIC: `public`,
  AUTHENTICATED: `authenticated`,
  FRESH: `fresh`,
};

export const FRESH_AUTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────
// Organization roles
// ─────────────────────────────────────────────
export const ORG_ROLES = {
  OWNER: `owner`,
  ADMIN: `admin`,
  MEMBER: `member`,
  VIEWER: `viewer`,
};

export const ORG_ROLE_VALUES = Object.values(ORG_ROLES);

// ─────────────────────────────────────────────
// Address types
// ─────────────────────────────────────────────
export const ADDRESS_TYPES = {
  HOME: `home`,
  WORK: `work`,
  BILLING: `billing`,
  SHIPPING: `shipping`,
  OTHER: `other`,
};

export const ADDRESS_TYPE_VALUES = Object.values(ADDRESS_TYPES);

// ─────────────────────────────────────────────
// Inquiry statuses
// ─────────────────────────────────────────────
export const INQUIRY_STATUSES = {
  NEW: `new`,
  READ: `read`,
  REPLIED: `replied`,
  ARCHIVED: `archived`,
};

export const INQUIRY_STATUS_VALUES = Object.values(INQUIRY_STATUSES);

// ─────────────────────────────────────────────
// Invitation statuses
// ─────────────────────────────────────────────
export const INVITATION_STATUSES = {
  PENDING: `pending`,
  ACCEPTED: `accepted`,
  DECLINED: `declined`,
  EXPIRED: `expired`,
};

export const INVITATION_STATUS_VALUES = Object.values(INVITATION_STATUSES);

// ─────────────────────────────────────────────
// Notification types
// ─────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  INVITATION: `invitation`,
  SYSTEM: `system`,
  BILLING: `billing`,
};
