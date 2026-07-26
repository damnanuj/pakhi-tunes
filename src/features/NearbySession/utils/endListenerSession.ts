import { usePlayerStore } from "src/features/Player/store/playerStore";
import { leaveListenerSessionIfActive } from "./leaveListenerSession";

type PlayerCleanup = () => Promise<void>;

let playerCleanup: PlayerCleanup | null = null;
let inFlight: Promise<boolean> | null = null;

/**
 * PlayerContext owns the native player, so it registers its teardown here
 * instead of every caller needing the player context.
 */
export function setListenerPlayerCleanup(cleanup: PlayerCleanup | null) {
  playerCleanup = cleanup;
}

async function runTeardown(): Promise<boolean> {
  if (!leaveListenerSessionIfActive()) return false;

  usePlayerStore.getState().setActiveTrack(null);
  usePlayerStore.getState().resetPlayback();
  usePlayerStore.getState().setPlaybackLoading(false);

  try {
    await playerCleanup?.();
  } catch {
    // Store state is already cleared; a failed native reset must not leave the
    // listener stuck in a room that no longer exists.
  }

  return true;
}

/**
 * Leave the current listener session and clear playback.
 *
 * Idempotent and safe to call from competing paths (session:ended, a failed
 * rejoin, foreground revalidation, manual leave); concurrent callers share one
 * teardown and later calls no-op once the role is cleared.
 */
export function endListenerSession(): Promise<boolean> {
  if (inFlight) return inFlight;

  inFlight = runTeardown().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
