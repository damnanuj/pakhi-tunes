import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  useTrackPlayerEvents,
} from "react-native-track-player";
import type { ArtistSong } from "src/types/artistSongs.types";
import { usePlayerStore } from "../store/playerStore";
import type { QueueSource, ActiveTrack } from "../types";
import { resolveArtistSongToTrack } from "../utils/resolveArtistSongToTrack";
import {
  findSongIndex,
  getNextRepeatMode,
  hasNext,
  hasQueue,
  shuffleQueueKeepingCurrent,
} from "../utils/queueHelpers";
import { activeTrackToHistoryPayload } from "src/features/history/types/history.types";
import { recordPlayToHistory } from "src/features/history/hooks/useRecordHistory";
import { setPlaybackRemoteHandlers } from "../playbackRemoteBridge";
import {
  emitHostHeartbeatIfHosting,
  emitHostPauseIfHosting,
  emitHostPlayIfHosting,
  emitHostSeekIfHosting,
  emitHostTrackChangeIfHosting,
} from "src/features/NearbySession/utils/sessionHostBridge";
import {
  isListenerMode,
  isHostMode,
  useNearbySessionStore,
} from "src/features/NearbySession/store/nearbySessionStore";
import {
  setListenerPlayerCleanup,
} from "src/features/NearbySession/utils/endListenerSession";
import { leaveListenerSessionIfActive } from "src/features/NearbySession/utils/leaveListenerSession";
import { appToast } from "src/components/toast/appToastHelpers";
import {
  consumePrivateRoomHostNext,
  getPrivateRoomHostNextSong,
} from "src/features/NearbySession/utils/privateRoomHostQueue";
import {
  isRoomAdvanceInFlight,
  setRoomAdvanceInFlight,
} from "src/features/NearbySession/utils/roomAdvanceLock";
import { requestRoomPlayNextIfListener } from "src/features/NearbySession/utils/requestRoomPlayNextIfListener";
import {
  isPositionSyncSuspended,
  resetPositionSyncSuspension,
  suspendPositionSyncFromStatusForMs,
} from "../utils/playerPositionSync";
import {
  assertCanGuestListen,
  reportAndSwitch,
  startTracking,
  stopTracking,
} from "src/features/listening/services/listeningTracker";
import {
  endPresenceIfBackgroundAndNotPlaying,
  endPresenceSession,
} from "src/features/presence/utils/presenceHeartbeatCoordinator";
import { useAutoRecommendationQueue } from "../hooks/useAutoRecommendationQueue";

type PlayerContextValue = {
  playSong: (song: ArtistSong) => Promise<void>;
  /** Play a song now without clearing the local queue (e.g. host room-queue play-now). */
  playSongNow: (song: ArtistSong) => Promise<void>;
  playActiveTrack: (track: ActiveTrack) => Promise<void>;
  playSongFromQueue: (
    songs: ArtistSong[],
    startIndex: number,
    source: QueueSource
  ) => Promise<void>;
  playQueueAtIndex: (index: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToMillis: (millis: number) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  /** Stops native playback, releases the audio player, and clears track + playback state. */
  stopPlaybackAndClear: () => Promise<void>;
};

export const PlayerContext = createContext<PlayerContextValue | null>(null);

const PREVIOUS_SONG_THRESHOLD_MS = 3000;

const PLAYER_CAPABILITIES = [
  Capability.Play,
  Capability.Pause,
  Capability.SkipToNext,
  Capability.SkipToPrevious,
  Capability.SeekTo,
  Capability.Stop,
];

/**
 * The native player can emit progress updates with the pre-seek position briefly after
 * `seekTo` resolves. Skip applying those so the UI does not flicker.
 */
let onTrackEndedCallback: (() => void) | null = null;
let trackEndedHandledForId: string | null = null;
let playerSetupPromise: Promise<void> | null = null;

function repeatModeToRntp(repeatMode: "off" | "one" | "all"): RepeatMode {
  return repeatMode === "one" ? RepeatMode.Track : RepeatMode.Off;
}

async function ensurePlayerSetup() {
  if (!playerSetupPromise) {
    playerSetupPromise = (async () => {
      try {
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : String(error);
        if (!message.includes("already") && !message.includes("initialized")) {
          throw error;
        }
      }

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        progressUpdateEventInterval: 1,
        capabilities: PLAYER_CAPABILITIES,
        compactCapabilities: PLAYER_CAPABILITIES,
        notificationCapabilities: PLAYER_CAPABILITIES,
      });
    })();
  }

  return playerSetupPromise;
}

function activeTrackToRntpTrack(track: ActiveTrack) {
  return {
    id: track.id,
    url: track.uri,
    title: track.title,
    artist: track.artist,
    artwork: track.artworkUrl,
    duration: track.durationSec,
  };
}

function PlayerEventBridge() {
  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackProgressUpdated, Event.PlaybackQueueEnded],
    (event) => {
      if (event.type === Event.PlaybackState) {
        const state = event.state;
        const isPlaying = state === State.Playing;
        if (!isListenerMode()) {
          usePlayerStore.getState().setPlayback({ isPlaying });
        }

        if (isPlaying || state === State.Ready) {
          trackEndedHandledForId = null;
        }

        if (
          state === State.Ready ||
          state === State.Playing ||
          state === State.Paused ||
          state === State.Stopped ||
          state === State.Ended
        ) {
          usePlayerStore.getState().setPlaybackLoading(false);
        }
        return;
      }

      if (event.type === Event.PlaybackProgressUpdated) {
        const ignorePosition = isPositionSyncSuspended();
        const durationMillis =
          event.duration > 0 ? Math.round(event.duration * 1000) : undefined;
        const positionMillis = Math.round(event.position * 1000);

        usePlayerStore.getState().setPlayback({
          ...(!ignorePosition ? { positionMillis } : {}),
          ...(durationMillis !== undefined ? { durationMillis } : {}),
        });

        if (positionMillis < 500) {
          trackEndedHandledForId = null;
        }
        return;
      }

      if (event.type === Event.PlaybackQueueEnded) {
        const activeId = usePlayerStore.getState().activeTrack?.id ?? null;
        if (!activeId) return;

        const repeatMode = usePlayerStore.getState().repeatMode;
        if (repeatMode === "one") {
          onTrackEndedCallback?.();
          return;
        }

        if (trackEndedHandledForId !== activeId) {
          trackEndedHandledForId = activeId;
          onTrackEndedCallback?.();
        }
      }
    }
  );

  return null;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playRequestGenerationRef = useRef(0);
  const historyRecordedForTrackIdRef = useRef<string | null>(null);

  useAutoRecommendationQueue();

  const resetNativePlayer = useCallback(async () => {
    resetPositionSyncSuspension();
    trackEndedHandledForId = null;
    historyRecordedForTrackIdRef.current = null;
    try {
      await TrackPlayer.reset();
    } catch {
      /* ignore */
    }
  }, []);

  const applyRepeatModeToPlayer = useCallback(async () => {
    try {
      await TrackPlayer.setRepeatMode(
        repeatModeToRntp(usePlayerStore.getState().repeatMode)
      );
    } catch {
      /* ignore */
    }
  }, []);

  const loadAndPlayActiveTrack = useCallback(
    async (track: ActiveTrack) => {
      if (!assertCanGuestListen()) {
        return;
      }

      leaveListenerSessionIfActive();

      const requestGen = ++playRequestGenerationRef.current;
      trackEndedHandledForId = null;
      historyRecordedForTrackIdRef.current = null;
      usePlayerStore.getState().setPlaybackLoading(true);

      try {
        await ensurePlayerSetup();
        await TrackPlayer.reset();

        usePlayerStore.getState().setActiveTrack(track);

        await TrackPlayer.add(activeTrackToRntpTrack(track));
        await applyRepeatModeToPlayer();
        await TrackPlayer.play();

        if (historyRecordedForTrackIdRef.current !== track.id) {
          historyRecordedForTrackIdRef.current = track.id;
          recordPlayToHistory(activeTrackToHistoryPayload(track));
        }

        void reportAndSwitch(track);

        const progress = await TrackPlayer.getProgress();
        usePlayerStore.getState().setPlayback({
          isPlaying: true,
          positionMillis: Math.round(progress.position * 1000),
          durationMillis:
            progress.duration > 0
              ? Math.round(progress.duration * 1000)
              : track.durationSec * 1000,
        });

        if (
          !isListenerMode() &&
          !useNearbySessionStore.getState().isApplyingRemoteSync
        ) {
          emitHostTrackChangeIfHosting({
            trackId: track.id,
            trackTitle: track.title,
            trackArtist: track.artist,
            trackArtwork: track.artworkUrl,
            trackUri: track.uri,
            trackDuration:
              progress.duration > 0
                ? Math.round(progress.duration * 1000)
                : track.durationSec * 1000,
            positionMs: Math.round(progress.position * 1000),
            playing: true,
            repeatMode: usePlayerStore.getState().repeatMode,
          });
        }
      } catch {
        usePlayerStore.getState().setActiveTrack(null);
        usePlayerStore.getState().resetPlayback();
        usePlayerStore.getState().clearQueue();
        Alert.alert(
          "Could not play",
          "Rebuild the dev client so react-native-track-player is included, then try again."
        );
      } finally {
        if (playRequestGenerationRef.current === requestGen) {
          usePlayerStore.getState().setPlaybackLoading(false);
        }
      }
    },
    [applyRepeatModeToPlayer]
  );

  const loadAndPlayTrack = useCallback(
    async (song: ArtistSong) => {
      usePlayerStore.getState().setActiveArtistSong(song);
      const resolved = await resolveArtistSongToTrack(song);
      if (!resolved) {
        usePlayerStore.getState().setActiveArtistSong(null);
        return;
      }

      const { track, song: resolvedSong } = resolved;
      usePlayerStore.getState().setActiveArtistSong(resolvedSong);

      const { queue, queueIndex, originalQueue, shuffleEnabled } =
        usePlayerStore.getState();
      if (queue.length > 0) {
        const updatedQueue = queue.map((entry) =>
          entry.id === resolvedSong.id ? resolvedSong : entry
        );
        usePlayerStore.getState().updateQueueOrder(updatedQueue, queueIndex);
      }
      if (!shuffleEnabled && originalQueue.length > 0) {
        const updatedOriginal = originalQueue.map((entry) =>
          entry.id === resolvedSong.id ? resolvedSong : entry
        );
        usePlayerStore.getState().setOriginalQueue(updatedOriginal);
      }

      await loadAndPlayActiveTrack(track);
    },
    [loadAndPlayActiveTrack]
  );

  const playSong = useCallback(async (song: ArtistSong) => {
    if (await requestRoomPlayNextIfListener(song)) {
      return;
    }
    usePlayerStore.getState().clearQueue();
    await loadAndPlayTrack(song);
  }, [loadAndPlayTrack]);

  const playSongNow = useCallback(
    async (song: ArtistSong) => {
      if (await requestRoomPlayNextIfListener(song)) {
        return;
      }
      await loadAndPlayTrack(song);
    },
    [loadAndPlayTrack]
  );

  const playActiveTrack = useCallback(
    async (track: ActiveTrack) => {
      usePlayerStore.getState().clearQueue();
      await loadAndPlayActiveTrack(track);
    },
    [loadAndPlayActiveTrack]
  );

  const playSongFromQueue = useCallback(
    async (songs: ArtistSong[], startIndex: number, source: QueueSource) => {
      if (songs.length === 0 || startIndex < 0 || startIndex >= songs.length) {
        return;
      }

      const tappedSong = songs[startIndex];
      if (await requestRoomPlayNextIfListener(tappedSong)) {
        return;
      }

      const { shuffleEnabled } = usePlayerStore.getState();
      usePlayerStore.getState().setOriginalQueue(songs);

      const orderedQueue = shuffleEnabled
        ? shuffleQueueKeepingCurrent(songs, startIndex)
        : songs;
      const queueIndex = shuffleEnabled ? 0 : startIndex;

      usePlayerStore.getState().setQueue(orderedQueue, queueIndex, source);
      await loadAndPlayTrack(orderedQueue[queueIndex]);
    },
    [loadAndPlayTrack]
  );

  const playQueueAtIndex = useCallback(
    async (index: number) => {
      const state = usePlayerStore.getState();
      if (!hasQueue(state) || index < 0 || index >= state.queue.length) return;
      usePlayerStore.getState().setQueueIndex(index);
      await loadAndPlayTrack(state.queue[index]);
    },
    [loadAndPlayTrack]
  );

  const playPrivateRoomHostNext = useCallback(async () => {
    if (isRoomAdvanceInFlight()) return false;
    if (!getPrivateRoomHostNextSong()) return false;

    setRoomAdvanceInFlight(true);
    try {
      // Dequeue locally first so re-entrant track-end cannot replay the same head.
      const roomNext = consumePrivateRoomHostNext();
      if (!roomNext) return false;

      const state = usePlayerStore.getState();
      const nextIdx = state.queueIndex + 1;
      if (
        hasQueue(state) &&
        nextIdx < state.queue.length &&
        state.queue[nextIdx]?.id === roomNext.id
      ) {
        await playQueueAtIndex(nextIdx);
        return true;
      }

      usePlayerStore.getState().forcePlaySongNext(roomNext);
      const updated = usePlayerStore.getState();
      const insertedAt = updated.queueIndex + 1;
      if (
        insertedAt < updated.queue.length &&
        updated.queue[insertedAt]?.id === roomNext.id
      ) {
        await playQueueAtIndex(insertedAt);
        return true;
      }

      await loadAndPlayTrack(roomNext);
      return true;
    } finally {
      setRoomAdvanceInFlight(false);
    }
  }, [loadAndPlayTrack, playQueueAtIndex]);

  const seekToMillis = useCallback(async (millis: number) => {
    if (isListenerMode()) return;

    const activeTrack = usePlayerStore.getState().activeTrack;
    if (!activeTrack) return;

    const durMs =
      usePlayerStore.getState().durationMillis > 0
        ? usePlayerStore.getState().durationMillis
        : activeTrack.durationSec * 1000;
    if (!durMs || durMs <= 0) return;

    const clamped = Math.min(
      Math.max(0, Math.floor(millis)),
      Math.floor(durMs)
    );

    suspendPositionSyncFromStatusForMs(900);
    try {
      await TrackPlayer.seekTo(clamped / 1000);
      usePlayerStore.getState().setPlayback({ positionMillis: clamped });
      emitHostSeekIfHosting(clamped, usePlayerStore.getState().repeatMode);
    } catch {
      /* ignore */
    } finally {
      suspendPositionSyncFromStatusForMs(350);
    }
  }, []);

  const skipToNext = useCallback(async () => {
    if (isListenerMode()) return;

    if (await playPrivateRoomHostNext()) {
      return;
    }

    const state = usePlayerStore.getState();
    if (!hasQueue(state)) return;

    const { queue, queueIndex, repeatMode } = state;

    if (queueIndex < queue.length - 1) {
      await playQueueAtIndex(queueIndex + 1);
      return;
    }

    if (repeatMode === "all") {
      await playQueueAtIndex(0);
    }
  }, [playPrivateRoomHostNext, playQueueAtIndex]);

  const skipToPrevious = useCallback(async () => {
    if (isListenerMode()) return;

    const state = usePlayerStore.getState();
    const { positionMillis } = state;

    if (
      positionMillis > PREVIOUS_SONG_THRESHOLD_MS ||
      !hasQueue(state) ||
      state.queueIndex <= 0
    ) {
      await seekToMillis(0);
      try {
        await TrackPlayer.play();
      } catch {
        /* ignore */
      }
      return;
    }

    await playQueueAtIndex(state.queueIndex - 1);
  }, [playQueueAtIndex, seekToMillis]);

  const handleTrackEnded = useCallback(async () => {
    await stopTracking();

    const state = usePlayerStore.getState();
    const { repeatMode } = state;

    if (repeatMode === "one") {
      try {
        await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
        usePlayerStore.getState().setPlayback({
          positionMillis: 0,
          isPlaying: true,
        });
        if (isHostMode()) {
          emitHostSeekIfHosting(0, repeatMode);
          emitHostPlayIfHosting(0, repeatMode);
        }
      } catch {
        /* ignore */
      }
      return;
    }

    if (await playPrivateRoomHostNext()) {
      return;
    }

    if (!hasQueue(state)) {
      void endPresenceIfBackgroundAndNotPlaying();
      return;
    }

    if (hasNext(state)) {
      if (state.queueIndex < state.queue.length - 1) {
        await playQueueAtIndex(state.queueIndex + 1);
      } else if (state.repeatMode === "all") {
        await playQueueAtIndex(0);
      }
    } else {
      void endPresenceIfBackgroundAndNotPlaying();
    }
    // Do not clear trackEndedHandledForId here — PlayerEventBridge clears it
    // when the next track reaches Ready/Playing. Clearing immediately allowed
    // nested QueueEnded events during loadAndPlayTrack to re-enter in a loop.
  }, [playPrivateRoomHostNext, playQueueAtIndex]);

  useEffect(() => {
    onTrackEndedCallback = () => {
      void handleTrackEnded();
    };
    return () => {
      onTrackEndedCallback = null;
    };
  }, [handleTrackEnded]);

  const togglePlayPause = useCallback(async () => {
    if (isListenerMode()) {
      // Host owns playback. Leaving the room is only via the Leave button.
      appToast.info("Only the host controls playback");
      return;
    }

    const activeTrack = usePlayerStore.getState().activeTrack;
    if (!activeTrack) return;

    try {
      const state = await TrackPlayer.getPlaybackState();
      const progress = await TrackPlayer.getProgress();
      const positionMs = Math.round(progress.position * 1000);
      const repeatMode = usePlayerStore.getState().repeatMode;
      if (state.state === State.Playing) {
        await TrackPlayer.pause();
        void stopTracking();
        void endPresenceIfBackgroundAndNotPlaying();
        emitHostPauseIfHosting(positionMs, repeatMode);
      } else {
        if (!assertCanGuestListen()) {
          return;
        }
        await TrackPlayer.play();
        const activeTrack = usePlayerStore.getState().activeTrack;
        if (activeTrack) {
          startTracking(activeTrack);
        }
        emitHostPlayIfHosting(positionMs, repeatMode);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    const state = usePlayerStore.getState();
    if (!hasQueue(state) || !state.activeTrack) return;

    const nextEnabled = !state.shuffleEnabled;
    usePlayerStore.getState().setShuffleEnabled(nextEnabled);

    if (nextEnabled) {
      const currentIndex =
        state.queueIndex >= 0
          ? state.queueIndex
          : findSongIndex(state.queue, state.activeTrack.id);
      const shuffled = shuffleQueueKeepingCurrent(
        state.originalQueue.length > 0 ? state.originalQueue : state.queue,
        currentIndex >= 0 ? currentIndex : 0
      );
      usePlayerStore.getState().updateQueueOrder(shuffled, 0);
      return;
    }

    const original =
      state.originalQueue.length > 0 ? state.originalQueue : state.queue;
    const restoredIndex = findSongIndex(original, state.activeTrack.id);
    usePlayerStore.getState().updateQueueOrder(
      original,
      restoredIndex >= 0 ? restoredIndex : 0
    );
  }, []);

  const cycleRepeatMode = useCallback(() => {
    const current = usePlayerStore.getState().repeatMode;
    usePlayerStore.getState().setRepeatMode(getNextRepeatMode(current));
    void applyRepeatModeToPlayer();

    if (isHostMode()) {
      void (async () => {
        const progress = await TrackPlayer.getProgress();
        const state = usePlayerStore.getState();
        emitHostHeartbeatIfHosting({
          positionMs: Math.round(progress.position * 1000),
          playing: state.isPlaying,
          trackId: state.activeTrack?.id,
          repeatMode: state.repeatMode,
        });
      })();
    }
  }, [applyRepeatModeToPlayer]);

  const stopPlaybackAndClear = useCallback(async () => {
    await stopTracking();
    void endPresenceSession();
    await resetNativePlayer();
    usePlayerStore.getState().setActiveTrack(null);
    usePlayerStore.getState().resetPlayback();
    usePlayerStore.getState().setPlaybackLoading(false);
    usePlayerStore.getState().clearQueue();

    // Private host dismissed the song — keep room open, clear session track for lobby UI + listeners
    if (isHostMode() && useNearbySessionStore.getState().roomCode) {
      const active = useNearbySessionStore.getState().activeSession;
      if (active) {
        useNearbySessionStore.getState().setActiveSession({
          ...active,
          trackId: "",
          trackTitle: "",
          trackArtist: "",
          trackArtwork: "",
          trackUri: "",
          trackDuration: 0,
          playing: false,
          positionMs: 0,
        });
      }
      emitHostTrackChangeIfHosting({
        trackId: "",
        trackTitle: "",
        trackArtist: "",
        trackArtwork: "",
        trackUri: "",
        trackDuration: 0,
        positionMs: 0,
        playing: false,
      });
    }
  }, [resetNativePlayer]);

  useEffect(() => {
    setListenerPlayerCleanup(stopPlaybackAndClear);
    return () => setListenerPlayerCleanup(null);
  }, [stopPlaybackAndClear]);

  useEffect(() => {
    setPlaybackRemoteHandlers({
      play: () => {
        if (isListenerMode()) return;
        void TrackPlayer.play();
      },
      pause: () => {
        if (isListenerMode()) return;
        void TrackPlayer.pause();
      },
      stop: () => {
        if (isListenerMode()) return;
        void stopPlaybackAndClear();
      },
      next: () => {
        if (isListenerMode()) return;
        void skipToNext();
      },
      previous: () => {
        if (isListenerMode()) return;
        void skipToPrevious();
      },
      seek: (millis) => {
        if (isListenerMode()) return;
        void seekToMillis(millis);
      },
    });

    return () => {
      setPlaybackRemoteHandlers(null);
    };
  }, [seekToMillis, skipToNext, skipToPrevious, stopPlaybackAndClear]);

  useEffect(() => {
    void ensurePlayerSetup();
    return () => {
      void resetNativePlayer();
    };
  }, [resetNativePlayer]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      playSong,
      playSongNow,
      playActiveTrack,
      playSongFromQueue,
      playQueueAtIndex,
      togglePlayPause,
      seekToMillis,
      skipToNext,
      skipToPrevious,
      toggleShuffle,
      cycleRepeatMode,
      stopPlaybackAndClear,
    }),
    [
      playSong,
      playSongNow,
      playActiveTrack,
      playSongFromQueue,
      playQueueAtIndex,
      togglePlayPause,
      seekToMillis,
      skipToNext,
      skipToPrevious,
      toggleShuffle,
      cycleRepeatMode,
      stopPlaybackAndClear,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      <PlayerEventBridge />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayback must be used within PlayerProvider");
  }
  return ctx;
}
