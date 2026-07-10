import Constants from "expo-constants";
import { Platform } from "react-native";
import TrackPlayer, { State } from "react-native-track-player";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import { isAnalyticsTrackingEnabled } from "src/utils/constants/analyticsTracking";
import { usePlayerStore } from "src/features/Player/store/playerStore";

export type PresencePlatform = "ios" | "android" | "web";

function getInstalledAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "0.0.0"
  );
}

function resolvePlatform(): PresencePlatform {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

export function isPresenceTrackingEnabled(): boolean {
  return isAnalyticsTrackingEnabled();
}

async function buildCurrentTrackPayload() {
  const { activeTrack, isPlaying: storeIsPlaying } = usePlayerStore.getState();
  if (!activeTrack) {
    return null;
  }

  let isPlaying = storeIsPlaying;
  try {
    const playbackState = await TrackPlayer.getPlaybackState();
    isPlaying = playbackState.state === State.Playing;
  } catch {
    /* fall back to store state */
  }

  return {
    songId: activeTrack.id,
    encryptedId: activeTrack.encryptedId ?? "",
    title: activeTrack.title,
    artist: activeTrack.artist,
    artworkUrl: activeTrack.artworkUrl,
    isPlaying,
  };
}

export async function heartbeatPresence(deviceId: string): Promise<void> {
  if (!isPresenceTrackingEnabled()) return;

  await apiClient.post(endpoints.presence.heartbeat, {
    deviceId,
    platform: resolvePlatform(),
    appVersion: getInstalledAppVersion(),
    trackStats: true,
    currentTrack: await buildCurrentTrackPayload(),
  });
}

export async function endPresence(deviceId: string): Promise<void> {
  if (!isPresenceTrackingEnabled()) return;

  await apiClient.post(endpoints.presence.end, {
    deviceId,
    platform: resolvePlatform(),
    appVersion: getInstalledAppVersion(),
    trackStats: true,
  });
}
