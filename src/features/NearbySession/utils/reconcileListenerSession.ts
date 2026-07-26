import { appToast } from "src/components/toast/appToastHelpers";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import { endListenerSession } from "./endListenerSession";

/** Socket ack errors that mean the room is gone rather than unreachable. */
export function isMissingSessionAckError(error?: string): boolean {
  if (!error) return false;
  return /not found|no longer|ended/i.test(error);
}

export function isMissingRoomHttpError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404;
}

/** Drop a room the server has confirmed is gone and tell the listener why. */
export async function abandonEndedListenerSession(): Promise<void> {
  const left = await endListenerSession();
  if (left) appToast.info("The host ended this session");
}

/**
 * Re-join the socket room for the active listener session.
 *
 * The server drops a listener from the room on disconnect, so without this a
 * reconnected listener stops receiving track changes and the end event.
 */
export async function rejoinListenerSession(): Promise<void> {
  const state = useNearbySessionStore.getState();
  if (state.role !== "listener") return;

  const sessionId = state.activeSession?.id;
  if (!sessionId) return;

  const result = await sessionSocketService.joinAsListener(sessionId);
  if (result.ok) {
    useNearbySessionStore.getState().setIsConnected(true);
    return;
  }

  if (isMissingSessionAckError(result.error)) {
    await abandonEndedListenerSession();
    return;
  }

  useNearbySessionStore.getState().setIsConnected(false);
}
