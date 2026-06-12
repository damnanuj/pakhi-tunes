import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioStatus,
} from "expo-audio";
import type { ArtistSong } from "src/types/artistSongs.types";
import { usePlayerStore } from "../store/playerStore";
import type { QueueSource } from "../types";
import { mapArtistSongToTrack } from "../utils/mapArtistSongToTrack";
import {
  findSongIndex,
  getNextRepeatMode,
  hasNext,
  hasQueue,
  shuffleQueueKeepingCurrent,
} from "../utils/queueHelpers";

type PlayerContextValue = {
  playSong: (song: ArtistSong) => Promise<void>;
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

const PlayerContext = createContext<PlayerContextValue | null>(null);

const PREVIOUS_SONG_THRESHOLD_MS = 3000;

/**
 * The native player can emit status updates with the pre-seek position briefly after
 * `seekTo` resolves. Skip applying those so the UI does not flicker.
 */
let positionSyncSuspendedUntilMs = 0;
let onTrackEndedCallback: (() => void) | null = null;
let trackEndedHandledForId: string | null = null;

function suspendPositionSyncFromStatusForMs(ms: number) {
  const until = Date.now() + ms;
  if (until > positionSyncSuspendedUntilMs) {
    positionSyncSuspendedUntilMs = until;
  }
}

function syncStoreFromLoadedStatus(status: AudioStatus) {
  if (!status.isLoaded) return;
  const durationMillis =
    status.duration > 0 ? Math.round(status.duration * 1000) : undefined;
  const positionMillis = Math.round(status.currentTime * 1000);
  const ignorePosition = Date.now() < positionSyncSuspendedUntilMs;
  usePlayerStore.getState().setPlayback({
    isPlaying: status.playing,
    ...(!ignorePosition ? { positionMillis } : {}),
    ...(durationMillis !== undefined ? { durationMillis } : {}),
  });

  if (status.didJustFinish) {
    const activeId = usePlayerStore.getState().activeTrack?.id ?? null;
    if (!activeId) return;

    const repeatMode = usePlayerStore.getState().repeatMode;
    if (repeatMode === "one") {
      // Native loop should replay; still invoke handler as a fallback restart.
      onTrackEndedCallback?.();
      return;
    }

    if (trackEndedHandledForId !== activeId) {
      trackEndedHandledForId = activeId;
      onTrackEndedCallback?.();
    }
  } else if (status.playing || status.currentTime < 0.5) {
    trackEndedHandledForId = null;
  }
}

type PlayerRef = ReturnType<typeof createAudioPlayer>;

function applyLoopForRepeatMode(player: PlayerRef | null) {
  if (!player?.isLoaded) return;
  player.loop = usePlayerStore.getState().repeatMode === "one";
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<PlayerRef | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);
  const playRequestGenerationRef = useRef(0);

  const unloadPlayer = useCallback(async () => {
    positionSyncSuspendedUntilMs = 0;
    trackEndedHandledForId = null;
    const sub = statusSubRef.current;
    statusSubRef.current = null;
    sub?.remove();
    const p = playerRef.current;
    playerRef.current = null;
    if (p) {
      try {
        if (p.isLoaded) {
          p.pause();
        }
      } catch {
        /* ignore */
      }
      try {
        p.remove();
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      void unloadPlayer();
    };
  }, [unloadPlayer]);

  const loadAndPlayTrack = useCallback(
    async (song: ArtistSong) => {
      const track = mapArtistSongToTrack(song);
      if (!track) return;

      const requestGen = ++playRequestGenerationRef.current;
      trackEndedHandledForId = null;
      usePlayerStore.getState().setPlaybackLoading(true);
      try {
        try {
          await unloadPlayer();

          await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
          });

          usePlayerStore.getState().setActiveTrack(track);

          const player = createAudioPlayer(
            { uri: track.uri },
            { updateInterval: 400 }
          );

          const sub = player.addListener("playbackStatusUpdate", (status) => {
            syncStoreFromLoadedStatus(status);
          });
          statusSubRef.current = sub;
          playerRef.current = player;
          applyLoopForRepeatMode(player);

          player.play();

          const initial = player.currentStatus;
          if (initial.isLoaded) {
            usePlayerStore.getState().setPlayback({
              isPlaying: initial.playing,
              positionMillis: Math.round(initial.currentTime * 1000),
              durationMillis:
                initial.duration > 0
                  ? Math.round(initial.duration * 1000)
                  : track.durationSec * 1000,
            });
          }
        } catch {
          usePlayerStore.getState().setActiveTrack(null);
          usePlayerStore.getState().resetPlayback();
          usePlayerStore.getState().clearQueue();
          Alert.alert(
            "Could not play",
            "Rebuild the dev client so expo-audio is included, then try again."
          );
        }
      } finally {
        if (playRequestGenerationRef.current === requestGen) {
          usePlayerStore.getState().setPlaybackLoading(false);
        }
      }
    },
    [unloadPlayer]
  );

  const playSong = useCallback(
    async (song: ArtistSong) => {
      usePlayerStore.getState().clearQueue();
      await loadAndPlayTrack(song);
    },
    [loadAndPlayTrack]
  );

  const playSongFromQueue = useCallback(
    async (songs: ArtistSong[], startIndex: number, source: QueueSource) => {
      if (songs.length === 0 || startIndex < 0 || startIndex >= songs.length) {
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

  const seekToMillis = useCallback(async (millis: number) => {
    const player = playerRef.current;
    if (!player || !player.isLoaded) return;

    const durSec = player.duration > 0 ? player.duration : undefined;
    const durMsFromPlayer =
      durSec !== undefined ? Math.round(durSec * 1000) : undefined;
    const durMs =
      durMsFromPlayer && durMsFromPlayer > 0
        ? durMsFromPlayer
        : usePlayerStore.getState().durationMillis;
    if (!durMs || durMs <= 0) return;

    const clamped = Math.min(
      Math.max(0, Math.floor(millis)),
      Math.floor(durMs)
    );

    const wasPlaying = player.playing === true;

    suspendPositionSyncFromStatusForMs(900);
    try {
      await player.seekTo(clamped / 1000);
      usePlayerStore.getState().setPlayback({ positionMillis: clamped });

      if (wasPlaying) {
        try {
          player.play();
        } catch {
          /* ignore */
        }

        const pollMs = 45;
        const timeoutMs = 15000;
        const advanceEpsMs = 12;
        const alignedSlackMs = 5000;
        const alignPlayingFallbackMs = 220;
        const advanceCapMs = 100;

        const afterSetPositionMs = Date.now();
        const waitUntil = Date.now() + timeoutMs;
        let phase: "align" | "advance" = "align";
        let prevReportedPos: number | null = null;
        let advanceStartedAtMs: number | null = null;

        while (Date.now() < waitUntil) {
          if (!player.isLoaded) return;
          const pos = Math.round(player.currentTime * 1000);
          const isPlayingNow = player.playing;

          if (phase === "align") {
            const aligned = Math.abs(pos - clamped) <= alignedSlackMs;
            const playingButReportsLag =
              isPlayingNow &&
              Date.now() - afterSetPositionMs >= alignPlayingFallbackMs;
            if (aligned || playingButReportsLag) {
              phase = "advance";
              prevReportedPos = null;
              advanceStartedAtMs = Date.now();
            }
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
          }

          if (!isPlayingNow) {
            prevReportedPos = null;
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
          }

          if (
            prevReportedPos !== null &&
            pos >= prevReportedPos + advanceEpsMs
          ) {
            break;
          }

          if (
            advanceStartedAtMs !== null &&
            Date.now() - advanceStartedAtMs >= advanceCapMs
          ) {
            break;
          }

          prevReportedPos = pos;
          await new Promise((r) => setTimeout(r, pollMs));
        }
      }
    } catch {
      /* ignore */
    } finally {
      suspendPositionSyncFromStatusForMs(350);
    }
  }, []);

  const skipToNext = useCallback(async () => {
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
  }, [playQueueAtIndex]);

  const skipToPrevious = useCallback(async () => {
    const state = usePlayerStore.getState();
    const { positionMillis } = state;

    if (
      positionMillis > PREVIOUS_SONG_THRESHOLD_MS ||
      !hasQueue(state) ||
      state.queueIndex <= 0
    ) {
      await seekToMillis(0);
      const player = playerRef.current;
      if (player?.isLoaded && !player.playing) {
        try {
          player.play();
        } catch {
          /* ignore */
        }
      }
      return;
    }

    await playQueueAtIndex(state.queueIndex - 1);
  }, [playQueueAtIndex, seekToMillis]);

  const handleTrackEnded = useCallback(async () => {
    try {
      const state = usePlayerStore.getState();
      const { repeatMode } = state;

      if (repeatMode === "one") {
        const player = playerRef.current;
        if (player?.isLoaded) {
          applyLoopForRepeatMode(player);
          // Native loop replays automatically; only manual-restart if playback stopped.
          if (player.loop && player.playing) return;
          try {
            await player.seekTo(0);
            player.play();
            usePlayerStore.getState().setPlayback({
              positionMillis: 0,
              isPlaying: true,
            });
          } catch {
            /* ignore */
          }
        }
        return;
      }

      if (!hasQueue(state)) return;

      if (hasNext(state)) {
        if (state.queueIndex < state.queue.length - 1) {
          await playQueueAtIndex(state.queueIndex + 1);
        } else if (state.repeatMode === "all") {
          await playQueueAtIndex(0);
        }
      }
    } finally {
      trackEndedHandledForId = null;
    }
  }, [playQueueAtIndex]);

  useEffect(() => {
    onTrackEndedCallback = () => {
      void handleTrackEnded();
    };
    return () => {
      onTrackEndedCallback = null;
    };
  }, [handleTrackEnded]);

  const togglePlayPause = useCallback(async () => {
    const player = playerRef.current;
    if (!player || !player.isLoaded) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
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
    applyLoopForRepeatMode(playerRef.current);
  }, []);

  const stopPlaybackAndClear = useCallback(async () => {
    await unloadPlayer();
    try {
      await setIsAudioActiveAsync(false);
      await setIsAudioActiveAsync(true);
    } catch {
      /* ignore */
    }
    usePlayerStore.getState().setActiveTrack(null);
    usePlayerStore.getState().resetPlayback();
    usePlayerStore.getState().setPlaybackLoading(false);
    usePlayerStore.getState().clearQueue();
  }, [unloadPlayer]);

  const value: PlayerContextValue = {
    playSong,
    playSongFromQueue,
    playQueueAtIndex,
    togglePlayPause,
    seekToMillis,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    cycleRepeatMode,
    stopPlaybackAndClear,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayback must be used within PlayerProvider");
  }
  return ctx;
}
