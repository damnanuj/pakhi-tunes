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
import { mapArtistSongToTrack } from "../utils/mapArtistSongToTrack";

type PlayerContextValue = {
  playSong: (song: ArtistSong) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToMillis: (millis: number) => Promise<void>;
  /** Stops native playback, releases the audio player, and clears track + playback state. */
  stopPlaybackAndClear: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/**
 * The native player can emit status updates with the pre-seek position briefly after
 * `seekTo` resolves. Skip applying those so the UI does not flicker.
 */
let positionSyncSuspendedUntilMs = 0;

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
}

type PlayerRef = ReturnType<typeof createAudioPlayer>;

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<PlayerRef | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);
  const playRequestGenerationRef = useRef(0);

  const unloadPlayer = useCallback(async () => {
    positionSyncSuspendedUntilMs = 0;
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

  const playSong = useCallback(
    async (song: ArtistSong) => {
      const track = mapArtistSongToTrack(song);
      if (!track) return;

      const requestGen = ++playRequestGenerationRef.current;
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

  const togglePlayPause = useCallback(async () => {
    const player = playerRef.current;
    if (!player || !player.isLoaded) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

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

      /**
       * `seekTo` often resolves before the native decoder has buffered
       * the new location — especially on large jumps. Keep callers (e.g. seek
       * spinner) waiting until playback is really running at the new time.
       *
       * Reported position often lags behind what you hear, so we combine:
       * — align to seek target when the OS reports it, or give up if already playing;
       * — prefer a small forward tick, but cap how long we wait on coarse timers.
       */
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
        /** If already playing but position hasn't caught the seek yet, don't spin for ages */
        const alignPlayingFallbackMs = 220;
        /** After align, don't wait longer than this for a position tick (quantized / slow updates) */
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
  }, [unloadPlayer]);

  const value: PlayerContextValue = {
    playSong,
    togglePlayPause,
    seekToMillis,
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
