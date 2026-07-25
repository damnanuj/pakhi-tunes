import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { NearbySession, SessionListener } from "../types/session.types";

function patchActiveSessionMetadata(patch: Partial<NearbySession>) {
  const active = useNearbySessionStore.getState().activeSession;
  if (!active) return;
  const updated = { ...active, ...patch };
  useNearbySessionStore.getState().setActiveSession(updated);
  const sessions = useNearbySessionStore.getState().nearbySessions;
  useNearbySessionStore.getState().setNearbySessions(
    sessions.map((s) => (s.id === updated.id ? { ...s, ...patch } : s))
  );
}

/** Apply listener roster / count from socket events (host + listener). */
export function applyListenersUpdate(payload: {
  listenerCount?: number;
  listeners?: SessionListener[];
}) {
  if (Array.isArray(payload.listeners)) {
    useNearbySessionStore.getState().setRoomListeners(payload.listeners);
    useNearbySessionStore
      .getState()
      .setListenerCount(payload.listeners.length);
    patchActiveSessionMetadata({
      listenerCount: payload.listeners.length,
      listeners: payload.listeners,
    });
    return;
  }

  if (payload.listenerCount !== undefined) {
    const count = Math.max(0, Number(payload.listenerCount));
    useNearbySessionStore.getState().setListenerCount(count);
    patchActiveSessionMetadata({ listenerCount: count });
  }
}
