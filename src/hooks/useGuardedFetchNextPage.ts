import { useCallback, useEffect, useReducer, useRef } from "react";

type FetchNextPageFn = (() => void) | (() => Promise<unknown>) | undefined;

interface PaginationGuardState {
  pending: boolean;
  pagesCountAtFetch: number;
}

const GUARD_SAFETY_TIMEOUT_MS = 10_000;

const guardStateByKey = new Map<string, PaginationGuardState>();

function getGuardState(key: string): PaginationGuardState {
  let state = guardStateByKey.get(key);
  if (!state) {
    state = { pending: false, pagesCountAtFetch: 0 };
    guardStateByKey.set(key, state);
  }
  return state;
}

function resetGuardState(key: string) {
  guardStateByKey.delete(key);
}

/**
 * Query-key-scoped infinite scroll guard: one fetch at a time until a new
 * page is appended. Shared across all hook instances with the same query key.
 */
export function useGuardedFetchNextPage(
  fetchNextPage: FetchNextPageFn,
  hasNextPage: boolean | undefined,
  pagesCount: number,
  enabled = true,
  isFetchingNextPage = false,
  isFetchNextPageError = false,
  resetKey?: unknown
) {
  const resetKeyRef = useRef(resetKey);
  const wasFetchingNextPageRef = useRef(isFetchingNextPage);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  const key = String(resetKey ?? "");
  const state = getGuardState(key);

  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const clearPending = useCallback(() => {
    state.pending = false;
    clearSafetyTimeout();
    forceUpdate();
  }, [state, clearSafetyTimeout]);

  useEffect(() => {
    if (resetKeyRef.current === resetKey) return;
    resetKeyRef.current = resetKey;
    clearSafetyTimeout();
    resetGuardState(key);
    forceUpdate();
  }, [resetKey, key, clearSafetyTimeout]);

  useEffect(() => {
    const wasFetching = wasFetchingNextPageRef.current;
    wasFetchingNextPageRef.current = isFetchingNextPage;

    if (!state.pending) return;

    if (pagesCount > state.pagesCountAtFetch) {
      clearPending();
      return;
    }

    if (isFetchNextPageError) {
      clearPending();
      return;
    }

    // Fetch finished without a new page (coalesced/duplicate request).
    if (wasFetching && !isFetchingNextPage) {
      clearPending();
    }
  }, [pagesCount, isFetchNextPageError, isFetchingNextPage, state, clearPending]);

  useEffect(() => clearSafetyTimeout, [clearSafetyTimeout]);

  const guardedFetchNextPage = useCallback(() => {
    if (
      !enabled ||
      !hasNextPage ||
      state.pending ||
      isFetchingNextPage
    ) {
      return;
    }

    state.pending = true;
    state.pagesCountAtFetch = pagesCount;
    clearSafetyTimeout();
    safetyTimeoutRef.current = setTimeout(() => {
      if (state.pending) {
        state.pending = false;
        safetyTimeoutRef.current = null;
        forceUpdate();
      }
    }, GUARD_SAFETY_TIMEOUT_MS);
    forceUpdate();
    void fetchNextPage?.();
  }, [
    enabled,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    pagesCount,
    state,
    clearSafetyTimeout,
  ]);

  const isLoadingMore = state.pending || isFetchingNextPage;

  return {
    fetchNextPage: guardedFetchNextPage,
    isLoadingMore,
  };
}

/** Reset guard state for a query key (e.g. after pull-to-refresh). */
export function resetPaginationGuard(resetKey: unknown) {
  resetGuardState(String(resetKey ?? ""));
}
