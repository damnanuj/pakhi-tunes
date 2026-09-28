import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  CatalogPlaylistSongsParams,
  CatalogPlaylistSongsResponse,
} from "src/types/catalogPlaylist.types";

export async function getCatalogPlaylistSongs(
  playlistId: string,
  params?: CatalogPlaylistSongsParams
): Promise<CatalogPlaylistSongsResponse> {
  const { data } = await apiClient.get<CatalogPlaylistSongsResponse>(
    endpoints.catalogPlaylistSongs(playlistId),
    { params }
  );
  return data;
}
