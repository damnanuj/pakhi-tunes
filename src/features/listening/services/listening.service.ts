import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import { isAnalyticsTrackingEnabled } from "src/utils/constants/analyticsTracking";

export type ListeningReportPayload = {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  albumName?: string;
  durationSec?: number;
  listenedMs: number;
  deviceId: string;
};

export type ListeningReportResult = {
  recorded: boolean;
  skipped?: boolean;
  guestRemainingMs: number | null;
  guestTotalListenedMs?: number | null;
};

type ListeningReportApiResponse = {
  data: ListeningReportResult;
  error: Record<string, unknown>;
  isSuccess: boolean;
};

export function isListeningTrackingEnabled(): boolean {
  return isAnalyticsTrackingEnabled();
}

export async function reportListening(
  payload: ListeningReportPayload
): Promise<ListeningReportResult> {
  if (!isListeningTrackingEnabled()) {
    return {
      recorded: false,
      skipped: true,
      guestRemainingMs: null,
    };
  }

  const { data } = await apiClient.post<ListeningReportApiResponse>(
    endpoints.listening.report,
    {
      ...payload,
      trackStats: true,
    }
  );

  return data.data;
}
