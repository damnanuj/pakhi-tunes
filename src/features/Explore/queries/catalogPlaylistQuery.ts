import { getCatalogPlaylistSongs } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { CatalogPlaylistSongsResponse } from "src/types/catalogPlaylist.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";

export const CATALOG_PLAYLIST_PAGE_SIZE = 20;

function getItems(res: CatalogPlaylistSongsResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: CatalogPlaylistSongsResponse,
  _allPages: CatalogPlaylistSongsResponse[]
): number | undefined {
  return getNextOffsetFromPagination<ArtistSong>(res, CATALOG_PLAYLIST_PAGE_SIZE);
}

export function getCatalogPlaylistQueryOptions(
  playlistId: string
): UseInfinitePaginatedQueryOptions<ArtistSong, CatalogPlaylistSongsResponse> {
  return {
    queryKey: ["catalogPlaylist", playlistId, CATALOG_PLAYLIST_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getCatalogPlaylistSongs(playlistId, {
        limit: CATALOG_PLAYLIST_PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: CATALOG_PLAYLIST_PAGE_SIZE,
    enabled: !!playlistId,
    getItemKey: getSongListKey,
  };
}
