import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  NewReleasesResponse,
  NewReleasesParams,
} from "src/types/newReleases.types";

export async function getNewReleases(
  params?: NewReleasesParams
): Promise<NewReleasesResponse> {
  const { data } = await apiClient.get<NewReleasesResponse>(
    endpoints.newReleases,
    { params }
  );
  return data;
}
