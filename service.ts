import { AppState } from "react-native";
import TrackPlayer, { Event, State } from "react-native-track-player";
import { getGuestDeviceId } from "./src/features/guest/store/guestStore";
import { getPlaybackRemoteHandlers } from "./src/features/Player/playbackRemoteBridge";
import {
  configurePresenceHeartbeat,
  endPresenceIfBackgroundAndNotPlaying,
  setPlaybackServicePresenceHeartbeat,
} from "./src/features/presence/utils/presenceHeartbeatCoordinator";
import { isAnalyticsTrackingEnabled } from "./src/utils/constants/analyticsTracking";

function syncPlaybackServicePresence(state: State) {
  if (!isAnalyticsTrackingEnabled()) return;

  configurePresenceHeartbeat(() => getGuestDeviceId());

  if (state === State.Playing) {
    setPlaybackServicePresenceHeartbeat(true);
    return;
  }

  if (
    state === State.Paused ||
    state === State.Stopped ||
    state === State.Ended
  ) {
    setPlaybackServicePresenceHeartbeat(false);

    if (AppState.currentState !== "active") {
      void endPresenceIfBackgroundAndNotPlaying();
    }
  }
}

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    getPlaybackRemoteHandlers()?.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    getPlaybackRemoteHandlers()?.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    getPlaybackRemoteHandlers()?.stop();
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    getPlaybackRemoteHandlers()?.next();
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    getPlaybackRemoteHandlers()?.previous();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    getPlaybackRemoteHandlers()?.seek(Math.round(event.position * 1000));
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    syncPlaybackServicePresence(event.state);
  });
};
