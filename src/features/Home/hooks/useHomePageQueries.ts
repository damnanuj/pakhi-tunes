import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getGenres, getTopArtists } from "src/services";
import { getNewReleaseSongs } from "src/types/newReleases.types";
import type { GenresResponse } from "src/types/genres.types";
import type { NewReleasesResponse } from "src/types/newReleases.types";
import type { TopArtistsResponse } from "src/types/topArtists.types";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";
import {
  getNewReleasesHomeAlbumsQueryOptions,
  getNewReleasesHomeSongsQueryOptions,
} from "../queries/newReleasesQuery";

const TOP_ARTISTS_LIMIT = 10;

function hasGenresContent(data: GenresResponse | undefined): boolean {
  return (data?.data?.length ?? 0) > 0;
}

function hasTopArtistsContent(data: TopArtistsResponse | undefined): boolean {
  return (data?.data?.results?.length ?? 0) > 0;
}

function hasNewReleasesAlbumsContent(
  data: NewReleasesResponse | undefined
): boolean {
  return (data?.data?.results?.length ?? 0) > 0;
}

function hasNewReleasesSongsContent(
  data: NewReleasesResponse | undefined
): boolean {
  return getNewReleaseSongs(data?.data?.results ?? []).length > 0;
}

export const HOME_QUERY_KEYS = [
  ["genres"],
  ["topArtists", TOP_ARTISTS_LIMIT],
  ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "album", "home"],
  ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "song", "home"],
] as const;

export function useHomePageQueries() {
  const [genresQuery, topArtistsQuery, albumsQuery, songsQuery] = useQueries({
    queries: [
      {
        queryKey: ["genres"] as const,
        queryFn: getGenres,
      },
      {
        queryKey: ["topArtists", TOP_ARTISTS_LIMIT] as const,
        queryFn: () => getTopArtists({ limit: TOP_ARTISTS_LIMIT }),
      },
      getNewReleasesHomeAlbumsQueryOptions(),
      getNewReleasesHomeSongsQueryOptions(),
    ],
  });

  const refetchAll = useCallback(() => {
    return Promise.all(
      [genresQuery, topArtistsQuery, albumsQuery, songsQuery].map((query) =>
        query.refetch()
      )
    );
  }, [genresQuery, topArtistsQuery, albumsQuery, songsQuery]);

  return useMemo(() => {
    const results = [genresQuery, topArtistsQuery, albumsQuery, songsQuery];

    const hasDisplayableContent =
      hasGenresContent(genresQuery.data) ||
      hasTopArtistsContent(topArtistsQuery.data) ||
      hasNewReleasesAlbumsContent(albumsQuery.data) ||
      hasNewReleasesSongsContent(songsQuery.data);

    const isAnyFetching = results.some((query) => query.isFetching);
    const isAnyPending = results.some((query) => query.isPending);

    const queryHasContent = [
      hasGenresContent(genresQuery.data),
      hasTopArtistsContent(topArtistsQuery.data),
      hasNewReleasesAlbumsContent(albumsQuery.data),
      hasNewReleasesSongsContent(songsQuery.data),
    ];

    const allFailedWithoutData = results.every((query, index) => {
      if (queryHasContent[index]) return false;
      return query.isError || query.fetchStatus === "paused";
    });

    return {
      hasDisplayableContent,
      isAnyFetching,
      isAnyPending,
      allFailedWithoutData,
      refetchAll,
    };
  }, [genresQuery, topArtistsQuery, albumsQuery, songsQuery, refetchAll]);
}
