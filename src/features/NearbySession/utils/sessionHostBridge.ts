import type {
  SessionHeartbeatPayload,
  SessionTrackChangePayload,
} from "../types/session.types";

type SessionHostBridge = {
  onPlay: (positionMs: number) => void;
  onPause: (positionMs: number) => void;
  onSeek: (positionMs: number) => void;
  onTrackChange: (payload: SessionTrackChangePayload) => void;
  onHeartbeat: (payload: SessionHeartbeatPayload) => void;
};

let bridge: SessionHostBridge | null = null;

export function setSessionHostBridge(handlers: SessionHostBridge | null) {
  bridge = handlers;
}

export function getSessionHostBridge() {
  return bridge;
}

export function emitHostPlayIfHosting(positionMs: number) {
  bridge?.onPlay(positionMs);
}

export function emitHostPauseIfHosting(positionMs: number) {
  bridge?.onPause(positionMs);
}

export function emitHostSeekIfHosting(positionMs: number) {
  bridge?.onSeek(positionMs);
}

export function emitHostTrackChangeIfHosting(payload: SessionTrackChangePayload) {
  bridge?.onTrackChange(payload);
}

export function emitHostHeartbeatIfHosting(payload: SessionHeartbeatPayload) {
  bridge?.onHeartbeat(payload);
}
