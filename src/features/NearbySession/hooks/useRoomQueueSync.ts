import { useEffect, useRef } from "react";
import { isSongImmediatelyNext } from "src/features/Player/utils/queueHelpers";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionQueueTrack } from "../types/session.types";
import { sessionQueueTrackToArtistSong } from "../types/session.types";

function applyRoomQueue(queue: SessionQueueTrack[]) {
  const store = useNearbySessionStore.getState();
  store.setRoomQueue(queue);
  const active = store.activeSession;
  if (active) {
    store.setActiveSession({ ...active, queue });
  }
}

function syncHostPlayNext(queue: SessionQueueTrack[]) {
  if (useNearbySessionStore.getState().role !== "host") return;
  if (queue.length === 0) return;

  const nextItem = queue[0];
  const player = usePlayerStore.getState();
  if (player.activeTrack?.id === nextItem.songId) return;
  if (isSongImmediatelyNext(player.queue, player.queueIndex, nextItem.songId)) {
    return;
  }

  player.playSongNext(sessionQueueTrackToArtistSong(nextItem));
}

export function useRoomQueueSync() {
  const role = useNearbySessionStore((s) => s.role);
  const roomQueue = useNearbySessionStore((s) => s.roomQueue);
  const activeTrackId = usePlayerStore((s) => s.activeTrack?.id);
  const lastAppliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== "host" && role !== "listener") return;

    const onQueueUpdated = (payload: { queue?: SessionQueueTrack[] }) => {
      const queue = Array.isArray(payload?.queue) ? payload.queue : [];
      applyRoomQueue(queue);
    };

    sessionSocketService.on("session:queueUpdated", onQueueUpdated);
    return () => {
      sessionSocketService.off("session:queueUpdated", onQueueUpdated);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "host") {
      lastAppliedKeyRef.current = null;
      return;
    }
    if (roomQueue.length === 0) {
      lastAppliedKeyRef.current = null;
      return;
    }

    const next = roomQueue[0];
    const key = `${next.queueItemId}:${next.songId}:${activeTrackId ?? ""}`;
    if (lastAppliedKeyRef.current === key) return;
    lastAppliedKeyRef.current = key;
    syncHostPlayNext(roomQueue);
  }, [role, roomQueue, activeTrackId]);
}
