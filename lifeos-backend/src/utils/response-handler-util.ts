import { Response } from 'express';
import { HTTP_STATUS_CODES, HttpStatusCode } from '../constants/http-status-constant';
import { ApiResponseFormat, PaginationMeta } from '../types/response-types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: HttpStatusCode = HTTP_STATUS_CODES.OK,
  meta?: Record<string, any>
): Response => {
  const responseBody: ApiResponseFormat<T> = {
    success: true,
    status: 'success',
    statusCode,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(responseBody);
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS_CODES.CREATED);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  totalRecords: number,
  message: string = 'Data retrieved successfully'
): Response => {
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const meta: PaginationMeta = {
    page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return sendSuccess(res, data, message, HTTP_STATUS_CODES.OK, meta);
};
