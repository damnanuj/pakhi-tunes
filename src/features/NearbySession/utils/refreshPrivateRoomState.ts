import {
  fetchMySession,
  fetchSessionByCode,
} from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type {
  NearbySession,
  SessionListener,
  SessionQueueTrack,
} from "../types/session.types";
import { applyHostStartAck } from "./applyHostStartAck";
import { applyListenersUpdate } from "./applyListenersUpdate";
import { connectSessionSocketReady } from "./connectSessionSocketReady";
import { syncRoomQueue } from "./syncRoomQueue";

function applyPrivateSessionSnapshot(session: NearbySession) {
  useNearbySessionStore.setState({
    activeSession: session,
    roomCode: session.roomCode ?? useNearbySessionStore.getState().roomCode,
    hostName: session.hostName,
    listenerCount: session.listenerCount,
    roomListeners: session.listeners ?? [],
    roomQueue: session.queue ?? [],
  });
  syncRoomQueue(session.queue ?? []);
  applyListenersUpdate({
    listeners: session.listeners,
    listenerCount: session.listenerCount,
  });
}

function mergeListenerJoinAck(
  base: NearbySession,
  ack?: Record<string, unknown>
): NearbySession {
  if (!ack) return base;
  return {
    ...base,
    positionMs:
      ack.positionMs !== undefined
        ? Math.max(0, Number(ack.positionMs))
        : base.positionMs,
    playing: ack.playing !== undefined ? Boolean(ack.playing) : base.playing,
    trackId: typeof ack.trackId === "string" ? ack.trackId : base.trackId,
    trackTitle:
      typeof ack.trackTitle === "string" ? ack.trackTitle : base.trackTitle,
    trackArtist:
      typeof ack.trackArtist === "string" ? ack.trackArtist : base.trackArtist,
    trackArtwork:
      typeof ack.trackArtwork === "string"
        ? ack.trackArtwork
        : base.trackArtwork,
    trackUri: typeof ack.trackUri === "string" ? ack.trackUri : base.trackUri,
    trackDuration:
      ack.trackDuration !== undefined
        ? Number(ack.trackDuration)
        : base.trackDuration,
    listenerCount:
      ack.listenerCount !== undefined
        ? Math.max(0, Number(ack.listenerCount))
        : base.listenerCount,
    listeners: Array.isArray(ack.listeners)
      ? (ack.listeners as SessionListener[])
      : base.listeners,
    queue: Array.isArray(ack.queue)
      ? (ack.queue as SessionQueueTrack[])
      : base.queue ?? [],
    updatedAt:
      typeof ack.updatedAt === "string" ? ack.updatedAt : base.updatedAt,
  };
}

/**
 * Pull latest private-room snapshot (queue + members) for host or listener.
 * Re-joins the socket room so live events keep flowing after a missed update.
 */
export async function refreshPrivateRoomState(): Promise<void> {
  const state = useNearbySessionStore.getState();
  const isPrivateHost =
    state.role === "host" && Boolean(state.roomCode);
  const isPrivateListener =
    state.role === "listener" &&
    state.activeSession?.visibility === "private";

  if (!isPrivateHost && !isPrivateListener) return;

  if (isPrivateHost) {
    const session = await fetchMySession();
    if (!session || session.visibility !== "private") return;

    applyPrivateSessionSnapshot(session);

    const socket = await connectSessionSocketReady();
    if (!socket) return;

    const result = await sessionSocketService.emitHostStart(session.id);
    if (result.ok) {
      applyHostStartAck(result);
    }
    useNearbySessionStore.getState().setIsConnected(true);
    return;
  }

  const code =
    state.activeSession?.roomCode ?? state.roomCode ?? null;
  const sessionId = state.activeSession?.id;
  if (!sessionId) return;

  let base = state.activeSession!;
  if (code) {
    try {
      base = await fetchSessionByCode(code);
    } catch {
      /* keep current snapshot */
    }
  }

  const socket = await connectSessionSocketReady();
  if (!socket) {
    applyPrivateSessionSnapshot(base);
    return;
  }

  const result = await sessionSocketService.joinAsListener(sessionId);
  if (!result.ok) {
    applyPrivateSessionSnapshot(base);
    useNearbySessionStore.getState().setIsConnected(true);
    return;
  }

  const live = mergeListenerJoinAck(base, result.session);
  applyPrivateSessionSnapshot(live);
  useNearbySessionStore.getState().setIsConnected(true);
}
