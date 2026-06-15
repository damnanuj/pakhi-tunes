import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { SongDetailResponse } from "src/types/songDetail.types";

export async function getSongById(id: string): Promise<ArtistSong> {
  const { data } = await apiClient.get<SongDetailResponse>(
    endpoints.songs.item(id)
  );
  return data.data;
}
