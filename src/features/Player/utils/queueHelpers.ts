import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack, QueueSource, RepeatMode } from "../types";

export const SEARCH_QUEUE_SOURCE: QueueSource = { type: "search" };

export function findSongIndex(songs: ArtistSong[], songId: string): number {
  return songs.findIndex((s) => s.id === songId);
}

export function isSongInQueue(queue: ArtistSong[], songId: string): boolean {
  return queue.some((s) => s.id === songId);
}

export function isSongImmediatelyNext(
  queue: ArtistSong[],
  queueIndex: number,
  songId: string
): boolean {
  const nextIndex = queueIndex + 1;
  if (nextIndex < 0 || nextIndex >= queue.length) return false;
  return queue[nextIndex]?.id === songId;
}

export function sourcesMatch(
  a: QueueSource | null,
  b: QueueSource | null
): boolean {
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  if (a.type === "newReleases" && b.type === "newReleases") {
    if (a.scope !== b.scope) return false;
    if (a.scope === "all" && b.scope === "all") {
      return a.language === b.language;
    }
    return true;
  }
  if (a.type === "album" && b.type === "album") return a.id === b.id;
  if (a.type === "artist" && b.type === "artist") return a.id === b.id;
  if (a.type === "genre" && b.type === "genre") return a.slug === b.slug;
  if (a.type === "favorites" && b.type === "favorites") return true;
  if (a.type === "history" && b.type === "history") return true;
  if (a.type === "playlist" && b.type === "playlist") return a.id === b.id;
  if (a.type === "search" && b.type === "search") return true;
  return false;
}

export function sourceSupportsQueuePagination(
  source: QueueSource | null
): boolean {
  return (
    source?.type === "artist" ||
    source?.type === "album" ||
    source?.type === "genre"
  );
}

export function getQueueSourceLabel(source: QueueSource | null): string {
  if (!source) return "Your library";
  switch (source.type) {
    case "album":
      return source.name;
    case "artist":
      return source.name;
    case "genre":
      return source.name;
    case "newReleases":
      return "New Releases";
    case "favorites":
      return source.name || "Favourites";
    case "history":
      return source.name || "Listening history";
    case "playlist":
      return source.name || "Playlist";
    case "search":
      return "";
    default:
      return "Your library";
  }
}

export function shouldShowQueueSourceLabel(source: QueueSource | null): boolean {
  return source?.type !== "search";
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shuffle all songs except the one at `keepIndex`, which stays at position 0. */
export function shuffleQueueKeepingCurrent(
  songs: ArtistSong[],
  keepIndex: number
): ArtistSong[] {
  if (songs.length <= 1) return [...songs];
  const current = songs[keepIndex];
  if (!current) return [...songs];
  const rest = songs.filter((_, i) => i !== keepIndex);
  return [current, ...shuffleArray(rest)];
}

type QueueStateSlice = {
  queue: ArtistSong[];
  queueIndex: number;
  queueSource: QueueSource | null;
  repeatMode: RepeatMode;
};

type BootstrapQueueStateSlice = QueueStateSlice & {
  activeArtistSong: ArtistSong | null;
  activeTrack: ActiveTrack | null;
};

export function hasQueue(state: QueueStateSlice): boolean {
  return state.queue.length > 1 && state.queueSource !== null;
}

export function shouldCollapseQueue(state: {
  queue: ArtistSong[];
  queueIndex: number;
  activeTrack: ActiveTrack | null;
}): boolean {
  if (state.queue.length !== 1) return false;
  const onlySong = state.queue[0];
  if (!onlySong || state.queueIndex !== 0) return false;
  return state.activeTrack?.id === onlySong.id;
}

export const collapsedQueueState = {
  queue: [] as ArtistSong[],
  originalQueue: [] as ArtistSong[],
  queueIndex: -1,
  queueSource: null as QueueSource | null,
};

export function canBootstrapQueue(state: BootstrapQueueStateSlice): boolean {
  if (hasQueue(state)) return false;
  if (!state.activeArtistSong) return false;
  return state.activeTrack?.id === state.activeArtistSong.id;
}

export function hasNext(state: QueueStateSlice): boolean {
  if (!hasQueue(state)) return false;
  if (state.queueIndex < state.queue.length - 1) return true;
  return state.repeatMode === "all" && state.queue.length > 0;
}

export function hasPreviousSong(state: QueueStateSlice): boolean {
  return hasQueue(state) && state.queueIndex > 0;
}

export const REPEAT_MODE_CYCLE: RepeatMode[] = ["off", "all", "one"];

export function getNextRepeatMode(current: RepeatMode): RepeatMode {
  const idx = REPEAT_MODE_CYCLE.indexOf(current);
  return REPEAT_MODE_CYCLE[(idx + 1) % REPEAT_MODE_CYCLE.length];
}
