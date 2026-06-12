import { create } from "zustand";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack, QueueSource, RepeatMode } from "../types";
import { findSongIndex } from "../utils/queueHelpers";

type PlaybackSlice = {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

type PlayerState = {
  activeTrack: ActiveTrack | null;
  /** True while a new track is loading into the native player (after UI shows active track). */
  isPlaybackLoading: boolean;
  queue: ArtistSong[];
  originalQueue: ArtistSong[];
  queueIndex: number;
  queueSource: QueueSource | null;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
} & PlaybackSlice;

type PlayerActions = {
  setActiveTrack: (track: ActiveTrack | null) => void;
  setPlayback: (partial: Partial<PlaybackSlice>) => void;
  setPlaybackLoading: (loading: boolean) => void;
  resetPlayback: () => void;
  setQueue: (
    songs: ArtistSong[],
    index: number,
    source: QueueSource
  ) => void;
  clearQueue: () => void;
  setQueueIndex: (index: number) => void;
  setShuffleEnabled: (enabled: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setOriginalQueue: (songs: ArtistSong[]) => void;
  updateQueueOrder: (songs: ArtistSong[], index: number) => void;
  syncQueueSongs: (songs: ArtistSong[]) => void;
};

const initialPlayback: PlaybackSlice = {
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
};

const initialQueue = {
  queue: [] as ArtistSong[],
  originalQueue: [] as ArtistSong[],
  queueIndex: -1,
  queueSource: null as QueueSource | null,
  shuffleEnabled: false,
  repeatMode: "off" as RepeatMode,
};

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  activeTrack: null,
  isPlaybackLoading: false,
  ...initialPlayback,
  ...initialQueue,
  setActiveTrack: (track) =>
    set({
      activeTrack: track,
      ...initialPlayback,
      durationMillis: track ? Math.max(0, track.durationSec) * 1000 : 0,
    }),
  setPlayback: (partial) => set(partial),
  setPlaybackLoading: (loading) => set({ isPlaybackLoading: loading }),
  resetPlayback: () => set(initialPlayback),
  setQueue: (songs, index, source) =>
    set({
      queue: songs,
      queueIndex: index,
      queueSource: source,
    }),
  clearQueue: () =>
    set({
      queue: [],
      originalQueue: [],
      queueIndex: -1,
      queueSource: null,
    }),
  setQueueIndex: (index) => set({ queueIndex: index }),
  setShuffleEnabled: (enabled) => set({ shuffleEnabled: enabled }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  setOriginalQueue: (songs) => set({ originalQueue: songs }),
  updateQueueOrder: (songs, index) =>
    set({
      queue: songs,
      queueIndex: index,
    }),
  syncQueueSongs: (songs) => {
    const state = get();
    if (state.shuffleEnabled || !state.activeTrack || !state.queueSource) {
      return;
    }
    const newIndex = findSongIndex(songs, state.activeTrack.id);
    if (newIndex < 0) return;
    set({
      queue: songs,
      originalQueue: songs,
      queueIndex: newIndex,
    });
  },
}));
