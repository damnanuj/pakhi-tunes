import { getPlaylists } from "../services/playlist.service";
import type {
  PlaylistListItem,
  PlaylistSongSort,
  PlaylistsResponse,
} from "../types/playlist.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";

export const PLAYLISTS_PAGE_SIZE = 20;
export const PLAYLISTS_QUERY_KEY = ["playlists"] as const;
export const PLAYLIST_DETAIL_QUERY_KEY = [
  ...PLAYLISTS_QUERY_KEY,
  "detail",
] as const;
export const PLAYLISTS_STALE_TIME_MS = 30_000;

export function getPlaylistsInfiniteQueryKey(): unknown[] {
  return [...PLAYLISTS_QUERY_KEY, PLAYLISTS_PAGE_SIZE];
}

export function getPlaylistDetailBaseQueryKey(id: string) {
  return [...PLAYLIST_DETAIL_QUERY_KEY, id] as const;
}

export function getPlaylistDetailQueryKey(id: string, sort: PlaylistSongSort) {
  return [...PLAYLIST_DETAIL_QUERY_KEY, id, sort] as const;
}

function getItems(res: PlaylistsResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: PlaylistsResponse,
  _allPages: PlaylistsResponse[]
): number | undefined {
  return getNextOffsetFromPagination<PlaylistListItem>(
    res,
    PLAYLISTS_PAGE_SIZE
  );
}

export function getPlaylistsQueryOptions(): UseInfinitePaginatedQueryOptions<
  PlaylistListItem,
  PlaylistsResponse
> {
  return {
    queryKey: getPlaylistsInfiniteQueryKey(),
    queryFn: ({ pageParam }) =>
      getPlaylists({ limit: PLAYLISTS_PAGE_SIZE, offset: pageParam }),
    getItems,
    getNextPageParam,
    pageSize: PLAYLISTS_PAGE_SIZE,
    getItemKey: (playlist) => playlist.id,
    staleTime: PLAYLISTS_STALE_TIME_MS,
  };
}
