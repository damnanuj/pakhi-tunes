import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type { ArtistSong } from "src/types/artistSongs.types";
import type {
  SongSuggestionsParams,
  SongSuggestionsResponse,
} from "src/types/songSuggestions.types";

const DEFAULT_LIMIT = 20;

export async function getSongSuggestions(
  params: SongSuggestionsParams
): Promise<ArtistSong[]> {
  const { songId, limit = DEFAULT_LIMIT } = params;
  if (!songId) return [];

  const { data } = await apiClient.get<SongSuggestionsResponse>(
    endpoints.songs.suggestions(songId),
    { params: { limit } }
  );

  if (!data?.isSuccess || !data.data) return [];
  return Array.isArray(data.data.results) ? data.data.results : [];
}
