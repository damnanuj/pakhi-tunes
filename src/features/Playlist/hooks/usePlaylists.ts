import { useInfinitePaginatedQuery } from "src/hooks/useInfinitePaginatedQuery";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistsQueryOptions,
} from "../queries/playlistQuery";

export { PLAYLISTS_QUERY_KEY };

export function usePlaylists() {
  const { isAuthenticated } = useAuth();
  const infiniteQuery = useInfinitePaginatedQuery({
    ...getPlaylistsQueryOptions(),
    enabled: isAuthenticated,
  });

  return {
    playlists: infiniteQuery.items,
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
