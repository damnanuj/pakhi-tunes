import { getGenres, getTopArtists } from "src/services";

/** How long this phone keeps the four homepage sections, including after the app is killed. */
export const HOME_PHONE_CACHE_MS = 2 * 60 * 60 * 1000;

export const TOP_ARTISTS_HOME_LIMIT = 10;

export function getGenresHomeQueryOptions() {
  return {
    queryKey: ["genres"] as const,
    queryFn: getGenres,
    staleTime: HOME_PHONE_CACHE_MS,
    gcTime: HOME_PHONE_CACHE_MS,
  };
}

export function getTopArtistsHomeQueryOptions() {
  return {
    queryKey: ["topArtists", TOP_ARTISTS_HOME_LIMIT] as const,
    queryFn: () => getTopArtists({ limit: TOP_ARTISTS_HOME_LIMIT }),
    staleTime: HOME_PHONE_CACHE_MS,
    gcTime: HOME_PHONE_CACHE_MS,
  };
}
