import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionQueueTrack } from "../types/session.types";

/** Mirror room queue into both `roomQueue` and `activeSession.queue`. */
export function syncRoomQueue(queue: SessionQueueTrack[]) {
  const store = useNearbySessionStore.getState();
  store.setRoomQueue(queue);
  const active = store.activeSession;
  if (active) {
    store.setActiveSession({ ...active, queue });
  }
}
