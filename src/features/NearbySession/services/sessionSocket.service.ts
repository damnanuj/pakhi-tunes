import { io, type Socket } from "socket.io-client";
import { ENV } from "src/utils/constants/env";
import { getAuthToken } from "src/features/auth/store/authStore";
import type { RepeatMode } from "src/features/Player/types";
import type {
  SessionHeartbeatPayload,
  SessionQueueAddPayload,
  SessionQueueTrack,
  SessionTrackChangePayload,
} from "../types/session.types";

type AckResponse = {
  ok: boolean;
  error?: string;
  session?: unknown;
  queue?: SessionQueueTrack[];
  item?: SessionQueueTrack | null;
};

const QUEUE_ADD_TIMEOUT_MS = 8_000;

class SessionSocketService {
  private socket: Socket | null = null;

  connect() {
    const token = getAuthToken();
    if (!token) return null;

    if (this.socket?.connected) return this.socket;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(ENV.SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Socket.io payloads are untyped at the wire; callers narrow in their handlers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, handler?: (...args: any[]) => void) {
    this.socket?.off(event, handler);
  }

  emitHostStart(sessionId: string) {
    return new Promise<{
      ok: boolean;
      error?: string;
      queue?: SessionQueueTrack[];
    }>((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: "Socket not connected" });
        return;
      }
      this.socket.emit("host:start", { sessionId }, (ack: AckResponse) => {
        resolve({
          ok: Boolean(ack?.ok),
          error: ack?.error,
          queue: Array.isArray(ack?.queue) ? ack.queue : undefined,
        });
      });
    });
  }

  emitHostPlay(positionMs: number, repeatMode?: RepeatMode) {
    this.socket?.emit("host:play", { positionMs, repeatMode });
  }

  emitHostPause(positionMs: number, repeatMode?: RepeatMode) {
    this.socket?.emit("host:pause", { positionMs, repeatMode });
  }

  emitHostSeek(positionMs: number, repeatMode?: RepeatMode) {
    this.socket?.emit("host:seek", { positionMs, repeatMode });
  }

  emitHostTrackChange(payload: SessionTrackChangePayload) {
    this.socket?.emit("host:trackChange", payload);
  }

  emitHostHeartbeat(payload: SessionHeartbeatPayload) {
    this.socket?.emit("host:heartbeat", payload);
  }

  emitHostStop() {
    this.socket?.emit("host:stop");
  }

  joinAsListener(sessionId: string) {
    return new Promise<{
      ok: boolean;
      error?: string;
      session?: Record<string, unknown>;
    }>((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: "Socket not connected" });
        return;
      }
      this.socket.emit(
        "listener:join",
        { sessionId },
        (ack: AckResponse) => {
          resolve({
            ok: Boolean(ack?.ok),
            error: ack?.error,
            session: ack?.session as Record<string, unknown> | undefined,
          });
        }
      );
    });
  }

  leaveAsListener() {
    this.socket?.emit("listener:leave");
  }

  addToRoomQueue(payload: SessionQueueAddPayload) {
    return new Promise<{
      ok: boolean;
      error?: string;
      queue?: SessionQueueTrack[];
    }>((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: "Socket not connected" });
        return;
      }

      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, error: "Request timed out" });
      }, QUEUE_ADD_TIMEOUT_MS);

      this.socket.emit(
        "listener:queueAdd",
        payload,
        (ack: AckResponse) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            ok: Boolean(ack?.ok),
            error: ack?.error,
            queue: Array.isArray(ack?.queue) ? ack.queue : undefined,
          });
        }
      );
    });
  }

  playRoomQueueItemNow(queueItemId: string) {
    return new Promise<{
      ok: boolean;
      error?: string;
      queue?: SessionQueueTrack[];
      item?: SessionQueueTrack | null;
    }>((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: "Socket not connected" });
        return;
      }

      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, error: "Request timed out" });
      }, QUEUE_ADD_TIMEOUT_MS);

      this.socket.emit(
        "host:queuePlayNow",
        { queueItemId },
        (ack: AckResponse) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            ok: Boolean(ack?.ok),
            error: ack?.error,
            queue: Array.isArray(ack?.queue) ? ack.queue : undefined,
            item: ack?.item ?? null,
          });
        }
      );
    });
  }
}

export const sessionSocketService = new SessionSocketService();
