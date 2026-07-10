import { getAuthToken } from "src/features/auth/store/authStore";
import { getGuestDeviceId } from "src/features/guest/store/guestStore";
import type { ActiveTrack } from "src/features/Player/types";
import {
  canGuestListenMore,
  useGuestListeningStore,
} from "../store/guestListeningStore";
import { showGuestListeningLimitDialog } from "src/components/guestLimit/guestListeningLimitDialogStore";
import {
  isListeningTrackingEnabled,
  reportListening,
} from "./listening.service";

const MIN_REPORT_MS = 1000;

let playStartedAt: number | null = null;
let currentTrack: ActiveTrack | null = null;
let reportInFlight = false;

function isAuthenticatedUser() {
  return Boolean(getAuthToken());
}

function computeListenedMs() {
  if (playStartedAt === null) return 0;
  return Math.max(0, Date.now() - playStartedAt);
}

async function sendReport(track: ActiveTrack, listenedMs: number) {
  if (!isListeningTrackingEnabled() || listenedMs < MIN_REPORT_MS) {
    return;
  }

  if (reportInFlight) return;
  reportInFlight = true;

  try {
    const result = await reportListening({
      songId: track.id,
      encryptedId: track.encryptedId,
      title: track.title,
      artist: track.artist,
      artworkUrl: track.artworkUrl,
      albumName: track.albumName,
      durationSec: track.durationSec,
      listenedMs,
      deviceId: getGuestDeviceId(),
    });

    if (!isAuthenticatedUser()) {
      if (typeof result.guestTotalListenedMs === "number") {
        useGuestListeningStore
          .getState()
          .setTotalListenedMs(result.guestTotalListenedMs);
      } else {
        useGuestListeningStore.getState().addListenedMs(listenedMs);
      }

      if (result.guestRemainingMs !== null && result.guestRemainingMs <= 0) {
        showGuestListeningLimitDialog();
      }
    }
  } catch (error) {
    console.warn("Listening report failed", error);
  } finally {
    reportInFlight = false;
  }
}

export function assertCanGuestListen(): boolean {
  if (isAuthenticatedUser()) return true;
  if (canGuestListenMore()) return true;
  showGuestListeningLimitDialog();
  return false;
}

export function startTracking(track: ActiveTrack) {
  currentTrack = track;
  playStartedAt = Date.now();
}

export async function stopTracking() {
  if (!currentTrack || playStartedAt === null) {
    playStartedAt = null;
    currentTrack = null;
    return;
  }

  const track = currentTrack;
  const listenedMs = computeListenedMs();
  playStartedAt = null;
  currentTrack = null;

  await sendReport(track, listenedMs);
}

export async function reportAndSwitch(nextTrack: ActiveTrack) {
  await stopTracking();
  startTracking(nextTrack);
}

export function getCurrentTrackedTrack() {
  return currentTrack;
}
