import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, BadRequestError, UnauthorizedError } from '../utils/app-error-util';
import { HTTP_STATUS_CODES } from '../constants/http-status-constant';
import { ERROR_MESSAGES, DB_ERROR_CODES } from '../constants/error-messages-constant';
import { envConfig } from '../config/environment-config';

const handleCastErrorDB = (err: any): AppError => {
  return new BadRequestError(ERROR_MESSAGES.INVALID_ID(err.path, err.value));
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] : 'duplicate value';
  return new BadRequestError(ERROR_MESSAGES.DUPLICATE_FIELD(value));
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors || {}).map((el: any) => el.message);
  return new BadRequestError(ERROR_MESSAGES.VALIDATION_FAILED(errors.join('. ')));
};

const handleJWTError = (): AppError =>
  new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

const handleJWTExpiredError = (): AppError =>
  new UnauthorizedError(ERROR_MESSAGES.EXPIRED_TOKEN);

const sendErrorDev = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    statusCode,
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error('[CRITICAL UNKNOWN ERROR]', err);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 'error',
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message, name: err.name };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === DB_ERROR_CODES.DUPLICATE_KEY) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (envConfig.nodeEnv === 'development') {
    sendErrorDev(error as AppError, res);
  } else {
    sendErrorProd(error as AppError, res);
  }
};
