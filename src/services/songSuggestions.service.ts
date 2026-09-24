import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type { ArtistSong } from "src/types/artistSongs.types";
import type {
  SongSuggestionsPage,
  SongSuggestionsParams,
  SongSuggestionsResponse,
} from "src/types/songSuggestions.types";

export const DEFAULT_SUGGESTIONS_LIMIT = 20;
export const SUGGESTIONS_MAX_LIMIT = 40;

export async function getSongSuggestions(
  params: SongSuggestionsParams
): Promise<SongSuggestionsPage> {
  const { songId, limit = DEFAULT_SUGGESTIONS_LIMIT, offset = 0 } = params;
  if (!songId) {
    return {
      seedSongId: "",
      results: [],
      count: 0,
      currentPage: 1,
      totalPages: 0,
      next: null,
      previous: null,
    };
  }

  const { data } = await apiClient.get<SongSuggestionsResponse>(
    endpoints.songs.suggestions(songId),
    { params: { limit, offset } }
  );

  if (!data?.isSuccess || !data.data) {
    return {
      seedSongId: songId,
      results: [],
      count: 0,
      currentPage: 1,
      totalPages: 0,
      next: null,
      previous: null,
    };
  }

  const page = data.data;
  return {
    seedSongId: page.seedSongId ?? songId,
    results: Array.isArray(page.results) ? page.results : [],
    count: page.count ?? 0,
    currentPage: page.currentPage ?? 1,
    totalPages: page.totalPages ?? 0,
    next: page.next ?? null,
    previous: page.previous ?? null,
  };
}

/** Fetch all suggestion pages (up to SUGGESTIONS_MAX_LIMIT) for queue seeding. */
export async function getAllSongSuggestions(songId: string): Promise<ArtistSong[]> {
  if (!songId) return [];

  const firstPage = await getSongSuggestions({
    songId,
    limit: DEFAULT_SUGGESTIONS_LIMIT,
    offset: 0,
  });

  const seen = new Set<string>();
  const merged: ArtistSong[] = [];

  for (const song of firstPage.results) {
    if (!song?.id || seen.has(song.id)) continue;
    seen.add(song.id);
    merged.push(song);
  }

  if (firstPage.next) {
    const secondPage = await getSongSuggestions({
      songId,
      limit: DEFAULT_SUGGESTIONS_LIMIT,
      offset: DEFAULT_SUGGESTIONS_LIMIT,
    });

    for (const song of secondPage.results) {
      if (!song?.id || seen.has(song.id)) continue;
      seen.add(song.id);
      merged.push(song);
      if (merged.length >= SUGGESTIONS_MAX_LIMIT) break;
    }
  }

  return merged.slice(0, SUGGESTIONS_MAX_LIMIT);
}
