import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  SongSearchParams,
  SongSearchResponse,
} from "src/types/songSearch.types";

export async function getSongSearch(
  params: SongSearchParams
): Promise<SongSearchResponse> {
  const { data } = await apiClient.get<SongSearchResponse>(
    endpoints.songSearch,
    { params }
  );
  return data;
}
