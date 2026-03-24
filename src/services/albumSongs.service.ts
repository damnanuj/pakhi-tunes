import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  AlbumSongsResponse,
  AlbumSongsParams,
} from "src/types/albumSongs.types";

export async function getAlbumSongs(
  albumId: string,
  params?: AlbumSongsParams
): Promise<AlbumSongsResponse> {
  const { data } = await apiClient.get<AlbumSongsResponse>(
    endpoints.albumSongs(albumId),
    { params }
  );
  return data;
}
