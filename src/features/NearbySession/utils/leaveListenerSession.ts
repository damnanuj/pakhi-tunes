import { resetPositionSyncSuspension } from "src/features/Player/utils/playerPositionSync";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";

export function leaveListenerSessionIfActive(): boolean {
  if (useNearbySessionStore.getState().role !== "listener") {
    return false;
  }

  sessionSocketService.leaveAsListener();
  resetPositionSyncSuspension();
  useNearbySessionStore.getState().resetSession();
  return true;
}
