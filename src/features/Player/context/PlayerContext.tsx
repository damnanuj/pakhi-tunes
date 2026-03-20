import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import type { ArtistSong } from "src/types/artistSongs.types";
import { usePlayerStore } from "../store/playerStore";
import { mapArtistSongToTrack } from "../utils/mapArtistSongToTrack";

type PlayerContextValue = {
  playSong: (song: ArtistSong) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToMillis: (millis: number) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/**
 * expo-av can emit status updates with the pre-seek position briefly after
 * `setPositionAsync` resolves. Skip applying those so the UI does not flicker.
 */
let positionSyncSuspendedUntilMs = 0;

function suspendPositionSyncFromStatusForMs(ms: number) {
  const until = Date.now() + ms;
  if (until > positionSyncSuspendedUntilMs) {
    positionSyncSuspendedUntilMs = until;
  }
}

/** Narrow shape from expo-av status callback (avoid static `expo-av` import). */
type LoadedPlaybackStatus = {
  isLoaded: true;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis?: number;
};

function syncStoreFromLoadedStatus(status: LoadedPlaybackStatus) {
  const durationMillis =
    status.durationMillis && status.durationMillis > 0
      ? status.durationMillis
      : undefined;
  const ignorePosition = Date.now() < positionSyncSuspendedUntilMs;
  usePlayerStore.getState().setPlayback({
    isPlaying: status.isPlaying,
    ...(!ignorePosition ? { positionMillis: status.positionMillis ?? 0 } : {}),
    ...(durationMillis !== undefined ? { durationMillis } : {}),
  });
}

type SoundRef = {
  unloadAsync: () => Promise<void>;
  getStatusAsync: () => Promise<
    { isLoaded: false } | ({ isLoaded: true } & Record<string, unknown>)
  >;
  pauseAsync: () => Promise<void>;
  playAsync: () => Promise<void>;
  setPositionAsync: (positionMillis: number) => Promise<void>;
};

async function loadExpoAv() {
  return import("expo-av");
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<SoundRef | null>(null);
  const playRequestGenerationRef = useRef(0);

  const unloadSound = useCallback(async () => {
    positionSyncSuspendedUntilMs = 0;
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try {
        await s.unloadAsync();
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      void unloadSound();
    };
  }, [unloadSound]);

  const playSong = useCallback(
    async (song: ArtistSong) => {
      const track = mapArtistSongToTrack(song);
      if (!track) return;

      const requestGen = ++playRequestGenerationRef.current;
      usePlayerStore.getState().setPlaybackLoading(true);
      try {
        let Audio: Awaited<ReturnType<typeof loadExpoAv>>["Audio"];
        try {
          ({ Audio } = await loadExpoAv());
        } catch {
          Alert.alert(
            "Playback unavailable",
            "Audio native module is missing. Rebuild the app (e.g. npx expo run:android) after adding expo-av."
          );
          return;
        }

        await unloadSound();

        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });

          usePlayerStore.getState().setActiveTrack(track);

          const { sound } = await Audio.Sound.createAsync(
            { uri: track.uri },
            { shouldPlay: true, progressUpdateIntervalMillis: 400 },
            (status) => {
              if (!status.isLoaded) return;
              syncStoreFromLoadedStatus(status as LoadedPlaybackStatus);
            }
          );

          soundRef.current = sound as unknown as SoundRef;

          const initial = await sound.getStatusAsync();
          if (initial.isLoaded) {
            usePlayerStore.getState().setPlayback({
              isPlaying: initial.isPlaying,
              positionMillis: initial.positionMillis ?? 0,
              durationMillis:
                initial.durationMillis && initial.durationMillis > 0
                  ? initial.durationMillis
                  : track.durationSec * 1000,
            });
          }
        } catch {
          usePlayerStore.getState().setActiveTrack(null);
          usePlayerStore.getState().resetPlayback();
          Alert.alert(
            "Could not play",
            "Rebuild the dev client so expo-av is included, then try again."
          );
        }
      } finally {
        if (playRequestGenerationRef.current === requestGen) {
          usePlayerStore.getState().setPlaybackLoading(false);
        }
      }
    },
    [unloadSound]
  );

  const togglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, []);

  const seekToMillis = useCallback(async (millis: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    const loaded = status as {
      durationMillis?: number;
      isPlaying?: boolean;
      positionMillis?: number;
    };
    const durMs =
      loaded.durationMillis && loaded.durationMillis > 0
        ? loaded.durationMillis
        : usePlayerStore.getState().durationMillis;
    if (!durMs || durMs <= 0) return;

    const clamped = Math.min(
      Math.max(0, Math.floor(millis)),
      Math.floor(durMs)
    );

    const wasPlaying = loaded.isPlaying === true;

    suspendPositionSyncFromStatusForMs(900);
    try {
      await sound.setPositionAsync(clamped);
      usePlayerStore.getState().setPlayback({ positionMillis: clamped });

      /**
       * `setPositionAsync` often resolves before the native decoder has buffered
       * the new location — especially on large jumps. Keep callers (e.g. seek
       * spinner) waiting until playback is really running at the new time.
       *
       * Reported `positionMillis` often lags behind what you hear, so we combine:
       * — align to seek target when the OS reports it, or give up if already playing;
       * — prefer a small forward tick, but cap how long we wait on coarse timers.
       */
      if (wasPlaying) {
        try {
          await sound.playAsync();
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
          const s = await sound.getStatusAsync();
          if (!s.isLoaded) return;
          const st = s as {
            isPlaying?: boolean;
            positionMillis?: number;
          };
          const pos = st.positionMillis ?? 0;

          if (phase === "align") {
            const aligned = Math.abs(pos - clamped) <= alignedSlackMs;
            const playingButReportsLag =
              st.isPlaying &&
              Date.now() - afterSetPositionMs >= alignPlayingFallbackMs;
            if (aligned || playingButReportsLag) {
              phase = "advance";
              prevReportedPos = null;
              advanceStartedAtMs = Date.now();
            }
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
          }

          if (!st.isPlaying) {
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

  const value: PlayerContextValue = {
    playSong,
    togglePlayPause,
    seekToMillis,
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
