import type { PlaylistSongSort } from "../types/playlist.types";

export const DEFAULT_PLAYLIST_SONG_SORT: PlaylistSongSort = "addedAt_desc";

export const PLAYLIST_SORT_OPTIONS: {
  value: PlaylistSongSort;
  label: string;
}[] = [
  { value: "addedAt_desc", label: "Date added (newest)" },
  { value: "addedAt_asc", label: "Date added (oldest)" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
];

export function getPlaylistSortLabel(sort: PlaylistSongSort): string {
  return (
    PLAYLIST_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    PLAYLIST_SORT_OPTIONS[0].label
  );
}
