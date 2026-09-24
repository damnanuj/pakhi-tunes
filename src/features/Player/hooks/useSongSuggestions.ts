import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_SUGGESTIONS_LIMIT,
  getSongSuggestions,
} from "src/services";
import type { SongSuggestionsPage } from "src/types/songSuggestions.types";

export { DEFAULT_SUGGESTIONS_LIMIT } from "src/services";
export const SONG_SUGGESTIONS_STALE_MS = 5 * 60 * 1000;

export function songSuggestionsQueryKey(
  songId: string,
  limit: number,
  offset: number
) {
  return ["songSuggestions", songId, limit, offset] as const;
}

export function allSongSuggestionsQueryKey(songId: string) {
  return ["songSuggestions", "all", songId] as const;
}

export function useSongSuggestions(
  songId: string | null | undefined,
  options?: { limit?: number; offset?: number; enabled?: boolean }
) {
  const limit = options?.limit ?? DEFAULT_SUGGESTIONS_LIMIT;
  const offset = options?.offset ?? 0;
  const enabled = (options?.enabled ?? true) && !!songId;

  return useQuery<SongSuggestionsPage>({
    queryKey: songSuggestionsQueryKey(songId ?? "", limit, offset),
    queryFn: () =>
      getSongSuggestions({
        songId: songId as string,
        limit,
        offset,
      }),
    enabled,
    staleTime: SONG_SUGGESTIONS_STALE_MS,
    retry: 1,
  });
}
