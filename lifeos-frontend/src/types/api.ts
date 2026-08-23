import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipToast?: boolean;
    skipSuccessToast?: boolean;
    skipErrorToast?: boolean;
    showSuccessToast?: boolean;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseFormat<T = any> {
  success: boolean;
  status: 'success' | 'failure' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  timestamp?: string;
  errors?: any[];
}

export interface ApiCustomError extends Error {
  statusCode?: number;
  status?: string;
  raw?: any;
}
