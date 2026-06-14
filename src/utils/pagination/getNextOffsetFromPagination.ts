import type { Pagination } from "src/types/pagination.types";

interface PaginatedPageShape<T> {
  data: Pagination & {
    results: T[];
  };
}

/** Parse `offset` query param from API `next` URL. */
export function parseOffsetFromNextUrl(next: string): number | null {
  const match = next.match(/[?&]offset=(\d+)/);
  if (!match) return null;
  const offset = parseInt(match[1], 10);
  return Number.isFinite(offset) ? offset : null;
}

/**
 * Derive the next page offset from API pagination metadata.
 * Stops when results are empty or `next` is null.
 */
export function getNextOffsetFromPagination<T>(
  response: PaginatedPageShape<T>,
  pageSize: number
): number | undefined {
  const { results, next, currentPage, totalPages } = response.data;
  if (!results.length) return undefined;
  if (!next) return undefined;
  if (totalPages > 0 && currentPage >= totalPages) return undefined;

  const parsed = parseOffsetFromNextUrl(next);
  if (parsed != null) return parsed;

  // currentPage is 1-based; next offset = currentPage * pageSize
  return currentPage * pageSize;
}
