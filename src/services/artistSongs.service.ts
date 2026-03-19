import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  ArtistSongsResponse,
  ArtistSongsParams,
} from "src/types/artistSongs.types";

export async function getArtistSongs(
  artistId: string,
  params?: ArtistSongsParams
): Promise<ArtistSongsResponse> {
  const { data } = await apiClient.get<ArtistSongsResponse>(
    endpoints.artistSongs(artistId),
    { params }
  );
  return data;
}
