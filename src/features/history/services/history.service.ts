import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  HistoryBulkResponse,
  HistoryClearResponse,
  HistoryParams,
  HistoryRemoveResponse,
  HistoryResponse,
  HistorySongPayload,
  HistoryUpsertResponse,
} from "../types/history.types";

export async function getHistory(params?: HistoryParams): Promise<HistoryResponse> {
  const { data } = await apiClient.get<HistoryResponse>(endpoints.history.list, {
    params,
  });
  return data;
}

export async function upsertHistory(payload: HistorySongPayload) {
  const { data } = await apiClient.post<HistoryUpsertResponse>(
    endpoints.history.list,
    payload
  );
  return data.data;
}

export async function bulkUpsertHistory(songs: HistorySongPayload[]) {
  const { data } = await apiClient.post<HistoryBulkResponse>(
    endpoints.history.bulk,
    { songs }
  );
  return data.data;
}

export async function removeHistory(songId: string) {
  const { data } = await apiClient.delete<HistoryRemoveResponse>(
    endpoints.history.item(songId)
  );
  return data.data;
}

export async function clearHistory() {
  const { data } = await apiClient.delete<HistoryClearResponse>(
    endpoints.history.list
  );
  return data.data;
}
