import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  GenresResponse,
  GenreSongsParams,
  GenreSongsResponse,
} from "src/types/genres.types";

export async function getGenres(): Promise<GenresResponse> {
  const { data } = await apiClient.get<GenresResponse>(endpoints.genres);
  return data;
}

export async function getGenreSongs(
  slug: string,
  params?: GenreSongsParams
): Promise<GenreSongsResponse> {
  const { data } = await apiClient.get<GenreSongsResponse>(
    endpoints.genreSongs(slug),
    { params }
  );
  return data;
}
