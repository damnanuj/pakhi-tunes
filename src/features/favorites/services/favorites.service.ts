import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  FavoriteMutationResponse,
  FavoriteSongPayload,
  FavoritesParams,
  FavoritesResponse,
  FavoriteStatusResponse,
} from "../types/favorites.types";

export async function getFavorites(params?: FavoritesParams) {
  const { data } = await apiClient.get<FavoritesResponse>(endpoints.favorites.list, {
    params,
  });
  return data.data;
}

export async function addFavorite(payload: FavoriteSongPayload) {
  const { data } = await apiClient.post<FavoriteMutationResponse>(
    endpoints.favorites.list,
    payload
  );
  return data.data;
}

export async function removeFavorite(songId: string) {
  const { data } = await apiClient.delete<FavoriteMutationResponse>(
    endpoints.favorites.item(songId)
  );
  return data.data;
}

export async function getFavoriteStatus(songId: string) {
  const { data } = await apiClient.get<FavoriteStatusResponse>(
    endpoints.favorites.status(songId)
  );
  return data.data;
}
