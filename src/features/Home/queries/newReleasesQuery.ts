import { getNewReleases } from "src/services";
import type { NewReleasesResponse } from "src/types/newReleases.types";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";
import { HOME_PHONE_CACHE_MS } from "./homeCatalogQuery";

const NEW_RELEASES_STALE_TIME_MS = 5 * 60 * 1000;

export function getNewReleasesHomeAlbumsQueryOptions() {
  return {
    queryKey: [
      "newReleases",
      NEW_RELEASES_QUEUE_FETCH_LIMIT,
      "album",
      "home",
    ] as const,
    queryFn: (): Promise<NewReleasesResponse> =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
        type: "album",
      }),
    staleTime: HOME_PHONE_CACHE_MS,
    gcTime: HOME_PHONE_CACHE_MS,
  };
}

export function getNewReleasesHomeSongsQueryOptions() {
  return {
    queryKey: [
      "newReleases",
      NEW_RELEASES_QUEUE_FETCH_LIMIT,
      "song",
      "home",
    ] as const,
    queryFn: (): Promise<NewReleasesResponse> =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
        type: "song",
      }),
    staleTime: HOME_PHONE_CACHE_MS,
    gcTime: HOME_PHONE_CACHE_MS,
  };
}

export function getNewReleasesAllAlbumsQueryOptions(language: string) {
  return {
    queryKey: [
      "newReleases",
      NEW_RELEASES_QUEUE_FETCH_LIMIT,
      "album",
      language,
      "all",
    ] as const,
    queryFn: (): Promise<NewReleasesResponse> =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
        type: "album",
        language,
      }),
    staleTime: NEW_RELEASES_STALE_TIME_MS,
  };
}

export function getNewReleasesAllSongsQueryOptions(language: string) {
  return {
    queryKey: [
      "newReleases",
      NEW_RELEASES_QUEUE_FETCH_LIMIT,
      "song",
      language,
      "all",
    ] as const,
    queryFn: (): Promise<NewReleasesResponse> =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
        type: "song",
        language,
      }),
    staleTime: NEW_RELEASES_STALE_TIME_MS,
  };
}
