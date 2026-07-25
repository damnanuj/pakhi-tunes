import { useEffect, useRef } from "react";
import { isSongImmediatelyNext } from "src/features/Player/utils/queueHelpers";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionQueueTrack } from "../types/session.types";
import { sessionQueueTrackToArtistSong } from "../types/session.types";
import {
  getLastConsumedRoomQueueMeta,
  isRoomAdvanceInFlight,
  isStaleConsumedQueueEcho,
} from "../utils/roomAdvanceLock";
import { syncRoomQueue } from "../utils/syncRoomQueue";

/** Insert room queue head into host local play-next slot (queue mutation only). */
export function ensureHostRoomPlayNext(
  queue: SessionQueueTrack[],
  lastAppliedQueueItemId?: { current: string | null }
) {
  if (isRoomAdvanceInFlight()) return;
  if (useNearbySessionStore.getState().role !== "host") return;
  if (queue.length === 0) {
    if (lastAppliedQueueItemId) lastAppliedQueueItemId.current = null;
    return;
  }

  const nextItem = queue[0];
  if (
    lastAppliedQueueItemId &&
    lastAppliedQueueItemId.current === nextItem.queueItemId
  ) {
    const player = usePlayerStore.getState();
    if (
      isSongImmediatelyNext(player.queue, player.queueIndex, nextItem.songId)
    ) {
      return;
    }
  }

  const player = usePlayerStore.getState();
  if (player.activeTrack?.id === nextItem.songId) {
    if (lastAppliedQueueItemId) {
      lastAppliedQueueItemId.current = nextItem.queueItemId;
    }
    return;
  }

  if (isSongImmediatelyNext(player.queue, player.queueIndex, nextItem.songId)) {
    if (lastAppliedQueueItemId) {
      lastAppliedQueueItemId.current = nextItem.queueItemId;
    }
    return;
  }

  player.forcePlaySongNext(sessionQueueTrackToArtistSong(nextItem));
  if (lastAppliedQueueItemId) {
    lastAppliedQueueItemId.current = nextItem.queueItemId;
  }
}

export function useRoomQueueSync() {
  const role = useNearbySessionStore((s) => s.role);
  const isConnected = useNearbySessionStore((s) => s.isConnected);
  const lastAppliedQueueItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== "host" && role !== "listener") {
      lastAppliedQueueItemIdRef.current = null;
      return;
    }
    // Wait until the socket exists — createRoom sets role before connect.
    if (!isConnected) return;

    const onQueueUpdated = (payload: { queue?: SessionQueueTrack[] }) => {
      let queue = Array.isArray(payload?.queue) ? payload.queue : [];
      if (isStaleConsumedQueueEcho(queue)) {
        return;
      }
      // Server may still show a head we already consumed while new items were pushed.
      const { queueItemId: consumedId } = getLastConsumedRoomQueueMeta();
      if (consumedId && queue[0]?.queueItemId === consumedId) {
        queue = queue.slice(1);
      }
      syncRoomQueue(queue);
      if (useNearbySessionStore.getState().role === "host") {
        ensureHostRoomPlayNext(queue, lastAppliedQueueItemIdRef);
      }
    };

    sessionSocketService.on("session:queueUpdated", onQueueUpdated);
    return () => {
      sessionSocketService.off("session:queueUpdated", onQueueUpdated);
    };
  }, [role, isConnected]);

  // One-shot sync when becoming host with an existing snapshot (no activeTrackId loop).
  useEffect(() => {
    if (role !== "host") {
      lastAppliedQueueItemIdRef.current = null;
      return;
    }
    const queue = useNearbySessionStore.getState().roomQueue;
    ensureHostRoomPlayNext(queue, lastAppliedQueueItemIdRef);
  }, [role]);
}
