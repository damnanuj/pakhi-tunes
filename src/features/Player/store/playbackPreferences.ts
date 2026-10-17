import { updatePreferences } from "src/features/auth/services/auth.service";
import { getAuthToken, useAuthStore } from "src/features/auth/store/authStore";
import type { AuthUser } from "src/features/auth/types/auth.types";
import type { DownloadQuality } from "src/features/Downloads/types/download.types";
import type { StreamQuality } from "../constants/streamQualityOptions";
import { DEFAULT_STREAM_QUALITY } from "../constants/streamQualityOptions";
import { useStreamQualityStore } from "./streamQualityStore";

const QUALITIES: StreamQuality[] = ["96kbps", "160kbps", "320kbps"];

function isAudioQuality(value: unknown): value is StreamQuality {
  return typeof value === "string" && QUALITIES.includes(value as StreamQuality);
}

async function pushPreferences(payload: {
  streamQuality?: StreamQuality;
  downloadQuality?: DownloadQuality | null;
}) {
  if (!getAuthToken()) return;
  try {
    const user = await updatePreferences(payload);
    useAuthStore.getState().setUser(user);
  } catch {
    // Device copy is already saved. The next signed-in change retries the account.
  }
}

export function setStreamQualityPreference(quality: StreamQuality) {
  useStreamQualityStore.getState().setQuality(quality);
  void pushPreferences({ streamQuality: quality });
}

export function setDownloadQualityPreference(quality: DownloadQuality | null) {
  useStreamQualityStore.getState().setDownloadQuality(quality);
  void pushPreferences({ downloadQuality: quality });
}

export function resetPlaybackPreferences() {
  useStreamQualityStore.getState().reset();
}

export async function mergePreferencesOnSignIn(user: AuthUser) {
  const local = useStreamQualityStore.getState();
  const accountStream = isAudioQuality(user.streamQuality)
    ? user.streamQuality
    : DEFAULT_STREAM_QUALITY;
  const accountDownload = isAudioQuality(user.downloadQuality)
    ? user.downloadQuality
    : null;

  let stream = accountStream;
  let download = accountDownload;
  const patch: {
    streamQuality?: StreamQuality;
    downloadQuality?: DownloadQuality | null;
  } = {};

  if (
    accountStream === DEFAULT_STREAM_QUALITY &&
    local.quality !== DEFAULT_STREAM_QUALITY
  ) {
    stream = local.quality;
    patch.streamQuality = local.quality;
  }

  if (accountDownload == null && local.downloadQuality) {
    download = local.downloadQuality;
    patch.downloadQuality = local.downloadQuality;
  }

  local.setQuality(stream);
  local.setDownloadQuality(download);

  if (patch.streamQuality || patch.downloadQuality) {
    await pushPreferences(patch);
  }
}
