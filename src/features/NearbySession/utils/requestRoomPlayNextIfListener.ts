import { appToast } from "src/components/toast/appToastHelpers";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { ArtistSong } from "src/types/artistSongs.types";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import {
  artistSongToSessionQueuePayload,
  sessionHasPlayableTrack,
} from "../types/session.types";

/**
 * When the user is a private-room listener, request room Play Next instead of
 * starting local playback. Returns true if the tap was consumed.
 */
export async function requestRoomPlayNextIfListener(
  song: ArtistSong
): Promise<boolean> {
  const state = useNearbySessionStore.getState();
  if (state.role !== "listener") return false;

  const session = state.activeSession;
  if (!session || session.visibility !== "private") return false;

  const title = decodeHtmlEntities(song.name);

  if (!sessionHasPlayableTrack(session)) {
    appToast.error("Wait for the host to start a song first");
    return true;
  }

  const result = await sessionSocketService.addToRoomQueue(
    artistSongToSessionQueuePayload(song)
  );

  if (!result.ok) {
    appToast.error(result.error ?? "Could not add to room queue");
    return true;
  }

  if (Array.isArray(result.queue)) {
    state.setRoomQueue(result.queue);
    if (state.activeSession) {
      state.setActiveSession({ ...state.activeSession, queue: result.queue });
    }
  }

  appToast.info(`Added "${title}" to room queue`);
  return true;
}
