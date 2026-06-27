import type { RepeatMode } from "src/features/Player/types";
import type {
  SessionHeartbeatPayload,
  SessionTrackChangePayload,
} from "../types/session.types";

type SessionHostBridge = {
  onPlay: (positionMs: number, repeatMode: RepeatMode) => void;
  onPause: (positionMs: number, repeatMode: RepeatMode) => void;
  onSeek: (positionMs: number, repeatMode: RepeatMode) => void;
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

export function emitHostPlayIfHosting(
  positionMs: number,
  repeatMode: RepeatMode
) {
  bridge?.onPlay(positionMs, repeatMode);
}

export function emitHostPauseIfHosting(
  positionMs: number,
  repeatMode: RepeatMode
) {
  bridge?.onPause(positionMs, repeatMode);
}

export function emitHostSeekIfHosting(
  positionMs: number,
  repeatMode: RepeatMode
) {
  bridge?.onSeek(positionMs, repeatMode);
}

export function emitHostTrackChangeIfHosting(payload: SessionTrackChangePayload) {
  bridge?.onTrackChange(payload);
}

export function emitHostHeartbeatIfHosting(payload: SessionHeartbeatPayload) {
  bridge?.onHeartbeat(payload);
}
