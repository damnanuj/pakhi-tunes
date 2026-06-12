import { getArtistSongs } from "src/services";
import type {
  ArtistSong,
  ArtistSongsResponse,
} from "src/types/artistSongs.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getSongListKey } from "../utils/songListKeys";

export const ARTIST_SONGS_PAGE_SIZE = 20;

function getItems(res: ArtistSongsResponse) {
  return res.data.results;
}

function getNextPageParam(res: ArtistSongsResponse): number | undefined {
  const { next, currentPage } = res.data;
  if (!next) return undefined;
  return currentPage * ARTIST_SONGS_PAGE_SIZE;
}

export function getArtistSongsQueryOptions(
  artistId: string
): UseInfinitePaginatedQueryOptions<ArtistSong, ArtistSongsResponse> {
  return {
    queryKey: ["artistSongs", artistId, ARTIST_SONGS_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getArtistSongs(artistId, {
        limit: ARTIST_SONGS_PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: ARTIST_SONGS_PAGE_SIZE,
    enabled: !!artistId,
    getItemKey: getSongListKey,
  };
}
