import { create } from "zustand";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack, QueueSource, RepeatMode } from "../types";
import {
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
  /** Always inserts at the immediate-next slot; bootstraps from active song/track if needed. */
  forcePlaySongNext: (song: ArtistSong) => void;
  /** Replace local up-next (after current) with these songs — used by room queue mirror. */
  replaceUpcomingWithSongs: (songs: ArtistSong[]) => void;
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

function artistSongFromActiveTrack(track: ActiveTrack): ArtistSong {
  const artistName = track.artist || "Unknown";
  const artist = {
    id: "",
    name: artistName,
    role: "artist" as const,
    image: [] as { quality: string; url: string }[],
    type: "artist" as const,
    url: "",
  };
  return {
    id: track.id,
    encrypted_id: track.encryptedId ?? "",
    name: track.title,
    type: "song",
    year: "",
    releaseDate: "",
    duration: track.durationSec || 0,
    label: track.label ?? "",
    explicitContent: false,
    playCount: 0,
    language: "",
    hasLyrics: false,
    lyricsId: null,
    lyrics: null,
    url: "",
    copyright: "",
    album: { id: "", name: track.albumName ?? "", url: "" },
    artists: {
      primary: [artist],
      featured: [],
      all: [artist],
    },
    image: track.artworkUrl
      ? [{ quality: "150x150", url: track.artworkUrl }]
      : [],
    downloadUrl: track.uri
      ? [{ quality: "unknown", url: track.uri }]
      : [],
  };
}

function bootstrapQueueFromActiveSong(
  get: () => PlayerState & PlayerActions,
  set: (partial: Partial<PlayerState>) => void
): boolean {
  const state = get();
  const song =
    state.activeArtistSong ??
    (state.activeTrack ? artistSongFromActiveTrack(state.activeTrack) : null);
  if (!song) return false;

  set({
    queue: [song],
    originalQueue: [song],
    queueIndex: 0,
    queueSource: SEARCH_QUEUE_SOURCE,
    ...(state.activeArtistSong ? {} : { activeArtistSong: song }),
  });
  return true;
}

function insertSongAsPlayNext(
  get: () => PlayerState & PlayerActions,
  set: (partial: Partial<PlayerState>) => void,
  song: ArtistSong
): void {
  const state = get();
  // hasQueue requires length > 1; single-track / empty hosts need bootstrap first.
  if (
    !state.queueSource ||
    state.queue.length === 0 ||
    state.queueIndex < 0 ||
    !hasQueue(state)
  ) {
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
  // Always derive index from the currently playing track so play-next lands
  // after "now", never in the already-played ("previous") section.
  let queueIndex = nextState.queueIndex;
  if (nextState.activeTrack?.id) {
    const activeIdx = findSongIndex(queue, nextState.activeTrack.id);
    if (activeIdx >= 0) {
      queueIndex = activeIdx;
    }
  }

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
}

/**
 * Replace everything after the current track with `songs` (room up-next mirror).
 * Keeps history + current; never inserts room songs into "previous".
 */
function applyUpcomingSongsReplacement(
  get: () => PlayerState & PlayerActions,
  set: (partial: Partial<PlayerState>) => void,
  songs: ArtistSong[]
): void {
  const state = get();
  if (
    !state.queueSource ||
    state.queue.length === 0 ||
    state.queueIndex < 0 ||
    !hasQueue(state)
  ) {
    if (!bootstrapQueueFromActiveSong(get, set)) return;
  }

  const next = get();
  if (
    !next.queueSource ||
    next.queue.length === 0 ||
    next.queueIndex < 0
  ) {
    return;
  }

  let queueIndex = next.queueIndex;
  if (next.activeTrack?.id) {
    const activeIdx = findSongIndex(next.queue, next.activeTrack.id);
    if (activeIdx >= 0) {
      queueIndex = activeIdx;
    }
  }

  const kept = next.queue.slice(0, queueIndex + 1);
  const keptIds = new Set(kept.map((s) => s.id));
  const seen = new Set<string>();
  const upcoming: ArtistSong[] = [];
  for (const song of songs) {
    if (!song?.id || keptIds.has(song.id) || seen.has(song.id)) continue;
    seen.add(song.id);
    upcoming.push(song);
  }

  const queue = [...kept, ...upcoming];
  set({
    queue,
    queueIndex,
    originalQueue: next.shuffleEnabled ? next.originalQueue : [...queue],
  });
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
    insertSongAsPlayNext(get, set, song);
  },
  forcePlaySongNext: (song) => {
    insertSongAsPlayNext(get, set, song);
  },
  replaceUpcomingWithSongs: (songs) => {
    applyUpcomingSongsReplacement(get, set, songs);
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
