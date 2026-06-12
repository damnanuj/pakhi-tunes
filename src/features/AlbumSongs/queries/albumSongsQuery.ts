import { getAlbumSongs } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { AlbumSongsResponse } from "src/types/albumSongs.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";

export const ALBUM_SONGS_PAGE_SIZE = 20;

function getItems(res: AlbumSongsResponse) {
  return res.data.results;
}

function getNextPageParam(res: AlbumSongsResponse): number | undefined {
  const { next, currentPage } = res.data;
  if (!next) return undefined;
  return currentPage * ALBUM_SONGS_PAGE_SIZE;
}

export function getAlbumSongsQueryOptions(
  albumId: string
): UseInfinitePaginatedQueryOptions<ArtistSong, AlbumSongsResponse> {
  return {
    queryKey: ["albumSongs", albumId, ALBUM_SONGS_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getAlbumSongs(albumId, {
        limit: ALBUM_SONGS_PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: ALBUM_SONGS_PAGE_SIZE,
    enabled: !!albumId,
    getItemKey: getSongListKey,
  };
}
