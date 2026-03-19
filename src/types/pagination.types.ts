/** Reusable pagination metadata for API responses */
export interface Pagination {
  count: number;
  currentPage: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
}

/** Reusable query params for paginated endpoints */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}
