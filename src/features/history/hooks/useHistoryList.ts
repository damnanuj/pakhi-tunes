import { useMemo } from "react";
import { useInfinitePaginatedQuery } from "src/hooks/useInfinitePaginatedQuery";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  HISTORY_QUERY_KEY,
  getHistoryQueryOptions,
} from "../queries/historyQuery";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import {
  localEntryToHistoryEntry,
  mergeHistoryEntries,
} from "../utils/historyCacheUpdates";

export { HISTORY_QUERY_KEY };

export function useHistoryList() {
  const { isAuthenticated } = useAuth();
  const infiniteQuery = useInfinitePaginatedQuery({
    ...getHistoryQueryOptions(),
    enabled: isAuthenticated,
  });
  const localEntries = useLocalHistoryStore((state) => state.entries);

  const localHistory = useMemo(() => {
    return Object.values(localEntries)
      .sort((a, b) => b.playedAtMs - a.playedAtMs)
      .map(localEntryToHistoryEntry);
  }, [localEntries]);

  const history = useMemo(() => {
    if (!isAuthenticated) {
      return localHistory;
    }

    return mergeHistoryEntries(infiniteQuery.items, localHistory);
  }, [isAuthenticated, infiniteQuery.items, localHistory]);

  if (isAuthenticated) {
    return {
      history,
      isLoading: infiniteQuery.isLoading,
      isError: infiniteQuery.isError,
      error: infiniteQuery.error,
      isFetching: infiniteQuery.isFetching,
      fetchNextPage: infiniteQuery.fetchNextPage,
      hasNextPage: infiniteQuery.hasNextPage,
      isLoadingMore: infiniteQuery.isLoadingMore,
      refetch: infiniteQuery.refetch,
    };
  }

  return {
    history,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    fetchNextPage: async () => undefined,
    hasNextPage: false,
    isLoadingMore: false,
    refetch: async () => undefined,
  };
}
