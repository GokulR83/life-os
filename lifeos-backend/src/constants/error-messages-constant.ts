export const DB_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
} as const;

export const ERROR_MESSAGES = {
  // General Errors
  RESOURCE_NOT_FOUND: 'The requested resource was not found on this server.',
  INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  BAD_REQUEST: 'Bad Request. Please check your input data.',

  // Auth & Token Errors
  UNAUTHORIZED: 'You are not logged in. Please log in to gain access.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_TOKEN: 'Invalid token. Please log in again.',
  EXPIRED_TOKEN: 'Your token has expired. Please log in again.',

  // Database Errors
  INVALID_ID: (path: string, value: string) => `Invalid ${path}: ${value}.`,
  DUPLICATE_FIELD: (value: string) => `Duplicate field value: ${value}. Please use another value!`,
  VALIDATION_FAILED: (errors: string) => `Invalid input data: ${errors}`,
} as const;
