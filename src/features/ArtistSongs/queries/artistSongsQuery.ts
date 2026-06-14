import { getArtistSongs } from "src/services";
import type {
  ArtistSong,
  ArtistSongsResponse,
} from "src/types/artistSongs.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";
import { getSongListKey } from "../utils/songListKeys";

export const ARTIST_SONGS_PAGE_SIZE = 20;
const ARTIST_SONGS_STALE_TIME_MS = 5 * 60 * 1000;

function getItems(res: ArtistSongsResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: ArtistSongsResponse,
  _allPages: ArtistSongsResponse[]
): number | undefined {
  return getNextOffsetFromPagination<ArtistSong>(res, ARTIST_SONGS_PAGE_SIZE);
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
    staleTime: ARTIST_SONGS_STALE_TIME_MS,
  };
}
