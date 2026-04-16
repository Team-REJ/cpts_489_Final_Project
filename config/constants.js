const ROLES = Object.freeze({
  STUDENT: 'student',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  FLAGGED: 'flagged',
  SUSPENDED: 'suspended',
});

const LISTING_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  REMOVED: 'removed',
});

const LISTING_TYPE = Object.freeze({
  SELL: 'sell',
  TRADE: 'trade',
  FREE: 'free',
});

const LISTING_CATEGORY = Object.freeze({
  TEXTBOOKS: 'textbooks',
  ELECTRONICS: 'electronics',
  FURNITURE: 'furniture',
  SPORTS: 'sports',
  CLOTHING: 'clothing',
  DORM_ESSENTIALS: 'dorm_essentials',
});

const LISTING_CONDITION = Object.freeze({
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
});

const REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

const MESSAGE_TYPE = Object.freeze({
  USER: 'user',
  SYSTEM: 'system',
  OFFER: 'offer',
});

const NOTIFICATION_TYPE = Object.freeze({
  REQUEST_RECEIVED: 'request_received',
  MESSAGE_RECEIVED: 'message_received',
  OFFER_MADE: 'offer_made',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  LISTING_REMOVED: 'listing_removed',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_REJECTED: 'request_rejected',
  ACCOUNT_FLAGGED: 'account_flagged',
});

const MODERATION_ACTION = Object.freeze({
  APPROVE_LISTING: 'approve_listing',
  REJECT_LISTING: 'reject_listing',
  REMOVE_LISTING: 'remove_listing',
  FLAG_USER: 'flag_user',
  SUSPEND_USER: 'suspend_user',
  UNSUSPEND_USER: 'unsuspend_user',
  CHANGE_ROLE: 'change_role',
});

const AUTH = Object.freeze({
  BCRYPT_COST: 10,
  PASSWORD_MIN_LENGTH: 8,
  WSU_EMAIL_PATTERN: /@wsu\.edu$/i,
  SESSION_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
  ROLES,
  ROLE_VALUES,
  USER_STATUS,
  LISTING_STATUS,
  LISTING_TYPE,
  LISTING_CATEGORY,
  LISTING_CONDITION,
  REQUEST_STATUS,
  MESSAGE_TYPE,
  NOTIFICATION_TYPE,
  MODERATION_ACTION,
  AUTH,
};
