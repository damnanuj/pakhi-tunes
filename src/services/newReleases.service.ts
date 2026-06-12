import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  NewReleasesResponse,
  NewReleasesParams,
} from "src/types/newReleases.types";

export async function getNewReleases(
  params?: NewReleasesParams
): Promise<NewReleasesResponse> {
  const query: Record<string, string | number> = {};

  if (params?.limit != null) query.limit = params.limit;
  if (params?.offset != null) query.offset = params.offset;

  const language = params?.language?.trim();
  if (language) query.language = language;

  if (params?.type) query.type = params.type;

  const { data } = await apiClient.get<NewReleasesResponse>(
    endpoints.newReleases,
    { params: query }
  );
  return data;
}
