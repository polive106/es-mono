// Application Constants

// Session Timeouts (FR-041)
export const SESSION_TIMEOUT_TALENT = 24 * 60 * 60 * 1000; // 24 hours in ms
export const SESSION_TIMEOUT_MANAGER = 4 * 60 * 60 * 1000; // 4 hours in ms

// Rate Limiting (FR-045)
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_READS = 100; // per minute per user
export const RATE_LIMIT_MAX_WRITES = 20; // per minute per user
export const RATE_LIMIT_MAX_PER_IP = 300; // per minute per IP

// Password Requirements (FR-040)
export const PASSWORD_MIN_LENGTH = 12;

// Data Retention (FR-044)
export const DATA_RETENTION_YEARS = 3;

// Invite Code
export const INVITE_CODE_LENGTH = 8;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  INVALID_SESSION: 'AUTH_002',
  PASSWORD_BREACHED: 'AUTH_003',
  INVALID_INVITE_CODE: 'AUTH_004',
  SESSION_EXPIRED: 'AUTH_005',

  // Authorization
  INSUFFICIENT_PERMISSIONS: 'AUTHZ_001',
  FORBIDDEN: 'AUTHZ_002',

  // Validation
  VALIDATION_ERROR: 'VAL_001',
  INVALID_INPUT: 'VAL_002',

  // Business Logic
  INVALID_STATE_TRANSITION: 'BIZ_001',
  RESOURCE_NOT_FOUND: 'BIZ_002',
  DUPLICATE_RESOURCE: 'BIZ_003',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_001',

  // Server
  INTERNAL_ERROR: 'SRV_001',
  DATABASE_ERROR: 'SRV_002',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;
