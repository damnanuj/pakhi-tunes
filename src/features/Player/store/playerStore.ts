import { create } from "zustand";
import type { ActiveTrack } from "../types";

type PlaybackSlice = {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

type PlayerState = {
  activeTrack: ActiveTrack | null;
} & PlaybackSlice;

type PlayerActions = {
  setActiveTrack: (track: ActiveTrack | null) => void;
  setPlayback: (partial: Partial<PlaybackSlice>) => void;
  resetPlayback: () => void;
};

const initialPlayback: PlaybackSlice = {
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
};

export const usePlayerStore = create<PlayerState & PlayerActions>((set) => ({
  activeTrack: null,
  ...initialPlayback,
  setActiveTrack: (track) =>
    set({
      activeTrack: track,
      ...initialPlayback,
      durationMillis: track ? Math.max(0, track.durationSec) * 1000 : 0,
    }),
  setPlayback: (partial) => set(partial),
  resetPlayback: () => set(initialPlayback),
}));
