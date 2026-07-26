import { useNearbySessionStore } from "../store/nearbySessionStore";
import { connectSessionSocketReady } from "./connectSessionSocketReady";
import { rejoinListenerSession } from "./reconcileListenerSession";
import { refreshPrivateRoomState } from "./refreshPrivateRoomState";

/**
 * Confirm the session we are showing still exists on the server.
 *
 * Called when the app returns to the foreground, where socket events that
 * arrived while suspended were lost.
 */
export async function revalidateSessionOnForeground(): Promise<void> {
  const state = useNearbySessionStore.getState();
  if (!state.role || !state.activeSession) return;

  const isPrivate =
    state.role === "host"
      ? Boolean(state.roomCode)
      : state.activeSession.visibility === "private";

  try {
    if (isPrivate) {
      await refreshPrivateRoomState();
      return;
    }

    if (state.role === "listener") {
      await connectSessionSocketReady();
      await rejoinListenerSession();
    }
  } catch {
    // Leave state untouched on transient failures; the socket reconnect path
    // revalidates again.
  }
}
