import { AppState } from "react-native";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import {
  endPresence,
  heartbeatPresence,
} from "../services/presence.service";

export const PRESENCE_HEARTBEAT_INTERVAL_MS = 15_000;

let intervalRef: ReturnType<typeof setInterval> | null = null;
let heartbeatInFlight = false;
let providerHeartbeatEnabled = false;
let playbackServiceHeartbeatEnabled = false;
let deviceIdProvider: (() => string) | null = null;

export function isMusicPlaying(): boolean {
  return usePlayerStore.getState().isPlaying;
}

export function isAppInForeground(): boolean {
  return AppState.currentState === "active";
}

export function configurePresenceHeartbeat(getDeviceId: () => string): void {
  deviceIdProvider = getDeviceId;
}

export async function runPresenceHeartbeat(): Promise<void> {
  if (!deviceIdProvider || heartbeatInFlight) return;

  heartbeatInFlight = true;
  try {
    await heartbeatPresence(deviceIdProvider());
  } catch (error) {
    console.warn("Presence heartbeat failed", error);
  } finally {
    heartbeatInFlight = false;
  }
}

function syncPresenceHeartbeatInterval(): void {
  const shouldRun =
    providerHeartbeatEnabled || playbackServiceHeartbeatEnabled;

  if (shouldRun) {
    if (!intervalRef) {
      void runPresenceHeartbeat();
      intervalRef = setInterval(() => {
        void runPresenceHeartbeat();
      }, PRESENCE_HEARTBEAT_INTERVAL_MS);
    }
    return;
  }

  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

export function setProviderPresenceHeartbeat(enabled: boolean): void {
  providerHeartbeatEnabled = enabled;
  syncPresenceHeartbeatInterval();
}

export function setPlaybackServicePresenceHeartbeat(enabled: boolean): void {
  playbackServiceHeartbeatEnabled = enabled;
  syncPresenceHeartbeatInterval();
}

export function stopPresenceHeartbeats(): void {
  providerHeartbeatEnabled = false;
  playbackServiceHeartbeatEnabled = false;
  syncPresenceHeartbeatInterval();
}

export async function endPresenceSession(): Promise<void> {
  if (!deviceIdProvider) return;

  try {
    await endPresence(deviceIdProvider());
  } catch (error) {
    console.warn("Presence end failed", error);
  }
}

export async function endPresenceIfBackgroundAndNotPlaying(): Promise<void> {
  if (isMusicPlaying() || isAppInForeground()) {
    return;
  }

  stopPresenceHeartbeats();
  await endPresenceSession();
}
