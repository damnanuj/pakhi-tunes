import { getGenreSongs } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { GenreSongsResponse } from "src/types/genres.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";

export const GENRE_SONGS_PAGE_SIZE = 20;
const GENRE_SONGS_STALE_TIME_MS = 5 * 60 * 1000;

function getItems(res: GenreSongsResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: GenreSongsResponse,
  _allPages: GenreSongsResponse[]
): number | undefined {
  return getNextOffsetFromPagination<ArtistSong>(res, GENRE_SONGS_PAGE_SIZE);
}

export function getGenreSongsQueryOptions(
  slug: string
): UseInfinitePaginatedQueryOptions<ArtistSong, GenreSongsResponse> {
  return {
    queryKey: ["genreSongs", slug, GENRE_SONGS_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getGenreSongs(slug, {
        limit: GENRE_SONGS_PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: GENRE_SONGS_PAGE_SIZE,
    enabled: !!slug,
    getItemKey: getSongListKey,
    staleTime: GENRE_SONGS_STALE_TIME_MS,
  };
}
