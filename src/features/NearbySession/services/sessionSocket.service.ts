import { io, type Socket } from "socket.io-client";
import { ENV } from "src/utils/constants/env";
import { getAuthToken } from "src/features/auth/store/authStore";
import type {
  SessionHeartbeatPayload,
  SessionTrackChangePayload,
} from "../types/session.types";

type AckResponse = { ok: boolean; error?: string; session?: unknown };

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

  on(event: string, handler: (...args: unknown[]) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: unknown[]) => void) {
    this.socket?.off(event, handler);
  }

  emitHostStart(sessionId: string) {
    return new Promise<{ ok: boolean; error?: string }>((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: "Socket not connected" });
        return;
      }
      this.socket.emit("host:start", { sessionId }, (ack: AckResponse) => {
        resolve({ ok: Boolean(ack?.ok), error: ack?.error });
      });
    });
  }

  emitHostPlay(positionMs: number) {
    this.socket?.emit("host:play", { positionMs });
  }

  emitHostPause(positionMs: number) {
    this.socket?.emit("host:pause", { positionMs });
  }

  emitHostSeek(positionMs: number) {
    this.socket?.emit("host:seek", { positionMs });
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
}

export const sessionSocketService = new SessionSocketService();
