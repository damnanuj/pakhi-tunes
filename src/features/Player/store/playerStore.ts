import { create } from "zustand";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack, QueueSource, RepeatMode } from "../types";
import {
  canBootstrapQueue,
  collapsedQueueState,
  findSongIndex,
  hasQueue,
  isSongInQueue,
  SEARCH_QUEUE_SOURCE,
  shouldCollapseQueue,
} from "../utils/queueHelpers";

type PlaybackSlice = {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
};

type PlayerState = {
  activeTrack: ActiveTrack | null;
  /** Full song metadata for the active track when playback started from ArtistSong. */
  activeArtistSong: ArtistSong | null;
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
  setActiveArtistSong: (song: ArtistSong | null) => void;
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
  appendQueueSongs: (newSongs: ArtistSong[]) => void;
  addSongToQueue: (song: ArtistSong) => void;
  playSongNext: (song: ArtistSong) => void;
  removeSongFromQueue: (songId: string) => void;
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

function bootstrapQueueFromActiveSong(
  get: () => PlayerState & PlayerActions,
  set: (partial: Partial<PlayerState>) => void
): boolean {
  const state = get();
  if (!canBootstrapQueue(state) || !state.activeArtistSong) return false;

  const song = state.activeArtistSong;
  set({
    queue: [song],
    originalQueue: [song],
    queueIndex: 0,
    queueSource: SEARCH_QUEUE_SOURCE,
  });
  return true;
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  activeTrack: null,
  activeArtistSong: null,
  isPlaybackLoading: false,
  ...initialPlayback,
  ...initialQueue,
  setActiveTrack: (track) =>
    set({
      activeTrack: track,
      ...(track === null ? { activeArtistSong: null } : {}),
      ...initialPlayback,
      durationMillis: track ? Math.max(0, track.durationSec) * 1000 : 0,
    }),
  setActiveArtistSong: (song) => set({ activeArtistSong: song }),
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
      activeArtistSong: null,
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
  appendQueueSongs: (newSongs) => {
    const state = get();
    if (state.shuffleEnabled || !state.activeTrack || !state.queueSource) {
      return;
    }
    const existingIds = new Set(state.queue.map((s) => s.id));
    const toAppend = newSongs.filter((s) => !existingIds.has(s.id));
    if (toAppend.length === 0) return;

    const merged = [...state.queue, ...toAppend];
    const newIndex = findSongIndex(merged, state.activeTrack.id);
    if (newIndex < 0) return;

    set({
      queue: merged,
      originalQueue: merged,
      queueIndex: newIndex,
    });
  },
  addSongToQueue: (song) => {
    const state = get();
    if (!hasQueue(state)) {
      if (!bootstrapQueueFromActiveSong(get, set)) return;
    }

    const nextState = get();
    if (!nextState.queueSource || nextState.queue.length === 0) return;
    if (isSongInQueue(nextState.queue, song.id)) return;

    const queue = [...nextState.queue, song];
    set({
      queue,
      originalQueue: nextState.shuffleEnabled
        ? nextState.originalQueue
        : [...nextState.originalQueue, song],
    });
  },
  playSongNext: (song) => {
    const state = get();
    if (!hasQueue(state)) {
      if (!bootstrapQueueFromActiveSong(get, set)) return;
    }

    const nextState = get();
    if (
      !nextState.queueSource ||
      nextState.queue.length === 0 ||
      nextState.queueIndex < 0
    ) {
      return;
    }
    if (nextState.activeTrack?.id === song.id) return;

    let queue = [...nextState.queue];
    let queueIndex = nextState.queueIndex;
    const existingIdx = findSongIndex(queue, song.id);

    if (existingIdx >= 0) {
      queue.splice(existingIdx, 1);
      if (existingIdx < queueIndex) {
        queueIndex -= 1;
      }
    }

    const insertAt = queueIndex + 1;
    queue.splice(insertAt, 0, song);

    set({
      queue,
      queueIndex,
      originalQueue: nextState.shuffleEnabled
        ? nextState.originalQueue
        : [...queue],
    });
  },
  removeSongFromQueue: (songId) => {
    const state = get();
    if (!state.queueSource || state.queue.length === 0) return;

    const removeIndex = findSongIndex(state.queue, songId);
    if (removeIndex < 0) return;
    if (state.activeTrack?.id === songId) return;

    const queue = state.queue.filter((s) => s.id !== songId);
    let queueIndex = state.queueIndex;
    if (removeIndex < queueIndex) {
      queueIndex -= 1;
    }

    const originalQueue = state.shuffleEnabled
      ? state.originalQueue.filter((s) => s.id !== songId)
      : queue;

    set({ queue, originalQueue, queueIndex });

    const updated = get();
    if (
      shouldCollapseQueue({
        queue: updated.queue,
        queueIndex: updated.queueIndex,
        activeTrack: updated.activeTrack,
      })
    ) {
      set(collapsedQueueState);
    }
  },
}));
