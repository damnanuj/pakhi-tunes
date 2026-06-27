import TrackPlayer, { Event } from "react-native-track-player";
import { getPlaybackRemoteHandlers } from "./src/features/Player/playbackRemoteBridge";

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
};
