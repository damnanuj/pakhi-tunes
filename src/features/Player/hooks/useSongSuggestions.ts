import { useQuery } from "@tanstack/react-query";
import { getSongSuggestions } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";

export const SONG_SUGGESTIONS_STALE_MS = 5 * 60 * 1000;
export const DEFAULT_SUGGESTIONS_LIMIT = 20;

export function songSuggestionsQueryKey(songId: string, limit: number) {
  return ["songSuggestions", songId, limit] as const;
}

export function useSongSuggestions(
  songId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const limit = options?.limit ?? DEFAULT_SUGGESTIONS_LIMIT;
  const enabled = (options?.enabled ?? true) && !!songId;

  return useQuery<ArtistSong[]>({
    queryKey: songSuggestionsQueryKey(songId ?? "", limit),
    queryFn: () =>
      getSongSuggestions({
        songId: songId as string,
        limit,
      }),
    enabled,
    staleTime: SONG_SUGGESTIONS_STALE_MS,
    retry: 1,
  });
}
