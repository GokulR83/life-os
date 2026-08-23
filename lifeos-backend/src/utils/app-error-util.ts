import { HTTP_STATUS_CODES, HttpStatusCode } from '../constants/http-status-constant';
import { ERROR_MESSAGES } from '../constants/error-messages-constant';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: HttpStatusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'failure' : 'error';
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = ERROR_MESSAGES.BAD_REQUEST) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS_CODES.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
  }
}
