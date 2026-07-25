/**
 * Holds a pending notification action that requires async content loading
 * (e.g. play_song) after navigation is ready.
 */
import type { ParsedNotificationAction } from "../types";

let pendingAction: ParsedNotificationAction | null = null;
const listeners = new Set<(action: ParsedNotificationAction | null) => void>();

export function setPendingNotificationAction(
  action: ParsedNotificationAction | null
) {
  pendingAction = action;
  listeners.forEach((listener) => listener(pendingAction));
}

export function getPendingNotificationAction() {
  return pendingAction;
}

export function consumePendingNotificationAction() {
  const action = pendingAction;
  pendingAction = null;
  listeners.forEach((listener) => listener(null));
  return action;
}

export function subscribePendingNotificationAction(
  listener: (action: ParsedNotificationAction | null) => void
) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
