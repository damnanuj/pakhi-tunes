import type { ArtistSong } from "src/types/artistSongs.types";
import type { QueueSource, RepeatMode } from "../types";

export function findSongIndex(songs: ArtistSong[], songId: string): number {
  return songs.findIndex((s) => s.id === songId);
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
  return false;
}

export function sourceSupportsQueuePagination(
  source: QueueSource | null
): boolean {
  return source?.type === "artist" || source?.type === "album";
}

export function getQueueSourceLabel(source: QueueSource | null): string {
  if (!source) return "Your library";
  switch (source.type) {
    case "album":
      return source.name;
    case "artist":
      return source.name;
    case "newReleases":
      return "New Releases";
    default:
      return "Your library";
  }
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

export function hasQueue(state: QueueStateSlice): boolean {
  return state.queue.length > 0 && state.queueSource !== null;
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
