import { useNearbySessionStore } from "../store/nearbySessionStore";
import {
  sessionQueueTrackToArtistSong,
  type SessionQueueTrack,
} from "../types/session.types";
import type { ArtistSong } from "src/types/artistSongs.types";
import {
  markRoomQueueHeadConsumed,
} from "./roomAdvanceLock";
import { syncRoomQueue } from "./syncRoomQueue";

export function isPrivateRoomHost() {
  const state = useNearbySessionStore.getState();
  return state.role === "host" && Boolean(state.roomCode);
}

export function getPrivateRoomHostNextItem(): SessionQueueTrack | null {
  if (!isPrivateRoomHost()) return null;
  return useNearbySessionStore.getState().roomQueue[0] ?? null;
}

export function getPrivateRoomHostNextSong(): ArtistSong | null {
  const next = getPrivateRoomHostNextItem();
  if (!next) return null;
  return sessionQueueTrackToArtistSong(next);
}

/**
 * Take room queue head for host playback and remove it locally immediately so
 * re-entrant track-end / skip handlers cannot replay the same item in a loop.
 * Server shift on host:trackChange (or queueUpdated) remains the source of truth.
 */
export function consumePrivateRoomHostNext(): ArtistSong | null {
  if (!isPrivateRoomHost()) return null;

  const store = useNearbySessionStore.getState();
  const queue = store.roomQueue;
  if (queue.length === 0) return null;

  const [head, ...rest] = queue;
  markRoomQueueHeadConsumed(head.queueItemId, rest.length);
  syncRoomQueue(rest);

  return sessionQueueTrackToArtistSong(head);
}
