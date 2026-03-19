import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  TopArtistsResponse,
  TopArtistsParams,
} from "src/types/topArtists.types";

export async function getTopArtists(
  params?: TopArtistsParams
): Promise<TopArtistsResponse> {
  const { data } = await apiClient.get<TopArtistsResponse>(
    endpoints.topArtists,
    { params }
  );
  return data;
}
