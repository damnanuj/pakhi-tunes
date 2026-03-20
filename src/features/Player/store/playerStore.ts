import { create } from "zustand";
import type { ActiveTrack } from "../types";

type PlaybackSlice = {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

type PlayerState = {
  activeTrack: ActiveTrack | null;
  /** True while a new track is loading into the native player (after UI shows active track). */
  isPlaybackLoading: boolean;
} & PlaybackSlice;

type PlayerActions = {
  setActiveTrack: (track: ActiveTrack | null) => void;
  setPlayback: (partial: Partial<PlaybackSlice>) => void;
  setPlaybackLoading: (loading: boolean) => void;
  resetPlayback: () => void;
};

const initialPlayback: PlaybackSlice = {
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
};

export const usePlayerStore = create<PlayerState & PlayerActions>((set) => ({
  activeTrack: null,
  isPlaybackLoading: false,
  ...initialPlayback,
  setActiveTrack: (track) =>
    set({
      activeTrack: track,
      ...initialPlayback,
      durationMillis: track ? Math.max(0, track.durationSec) * 1000 : 0,
    }),
  setPlayback: (partial) => set(partial),
  setPlaybackLoading: (loading) => set({ isPlaybackLoading: loading }),
  resetPlayback: () => set(initialPlayback),
}));
