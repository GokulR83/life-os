import { ApiResponse, PaginatedResponse } from '@lifeos/contracts';
export * from '@lifeos/contracts';

export type ApiResponseFormat<T = any> = ApiResponse<T>;

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
