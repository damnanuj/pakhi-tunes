import type {
  SessionListener,
  SessionQueueTrack,
} from "../types/session.types";
import { applyListenersUpdate } from "./applyListenersUpdate";
import { syncRoomQueue } from "./syncRoomQueue";

/** Apply host:start ack queue + listeners into the session store. */
export function applyHostStartAck(result: {
  queue?: SessionQueueTrack[];
  listeners?: SessionListener[];
  listenerCount?: number;
}) {
  if (Array.isArray(result.queue)) {
    syncRoomQueue(result.queue);
  }
  if (
    Array.isArray(result.listeners) ||
    result.listenerCount !== undefined
  ) {
    applyListenersUpdate({
      listeners: result.listeners,
      listenerCount: result.listenerCount,
    });
  }
}
