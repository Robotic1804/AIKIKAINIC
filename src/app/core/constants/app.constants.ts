
/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Timing Constants
export const TIMING = {
  DEBOUNCE_MS: 500,
  SHORT_DELAY_MS: 1000,
  MEDIUM_DELAY_MS: 2000,
  LONG_DELAY_MS: 3000,
  AOS_REFRESH_DELAY_MS: 100,
  SUCCESS_MESSAGE_DURATION_MS: 3000,
  ERROR_MESSAGE_DURATION_MS: 5000,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MIN_AGE: 4,
  MAX_AGE: 120,
  MIN_EVENT_DURATION_MINUTES: 15,
  DEFAULT_EVENT_DURATION_MINUTES: 90,
  DEFAULT_MAX_CAPACITY: 20,
} as const;

// Admin Constants
export const ADMIN = {
  MAX_ADMINS: 3,
} as const;

// Date Constants
export const CALENDAR = {
  DAYS_IN_MONTH: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  MONTH_NAMES: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  DAYS_IN_WEEK: 7,
} as const;

// Scroll Constants
export const SCROLL = {
  NAVBAR_SCROLL_THRESHOLD_PX: 50,
  SMOOTH_SCROLL_TOP_OFFSET_PX: 100,
} as const;
