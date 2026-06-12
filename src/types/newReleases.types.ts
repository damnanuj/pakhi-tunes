import type { Pagination, PaginationParams } from "./pagination.types";
import type { ArtistSong, ArtistSongImage } from "./artistSongs.types";

/** Album row from new-releases listing (no track metadata). */
export interface NewReleaseAlbumItem {
  id: string;
  encrypted_id: string;
  name: string;
  type: "album";
  url: string;
  image: ArtistSongImage[];
}

export type NewReleaseListItem = NewReleaseAlbumItem | ArtistSong;

export type NewReleaseType = "song" | "album";

export interface NewReleasesMeta {
  language: string | null;
  type: NewReleaseType | null;
  pageUrl: string;
  supportedLanguages: string[];
  browseLanguage: string | null;
  currentPageKey: string;
}

export interface NewReleasesData extends Pagination {
  results: NewReleaseListItem[];
  meta?: NewReleasesMeta;
}

export interface NewReleasesResponse {
  data: NewReleasesData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface NewReleasesParams extends PaginationParams {
  language?: string;
  /** Omit or leave unset to return both songs and albums. */
  type?: NewReleaseType;
}

export function isNewReleaseAlbum(
  item: NewReleaseListItem
): item is NewReleaseAlbumItem {
  return item.type === "album";
}

/** Song-type items from new-releases results, preserving API order. */
export function getNewReleaseSongs(
  results: NewReleaseListItem[]
): ArtistSong[] {
  return results.filter((item) => !isNewReleaseAlbum(item)) as ArtistSong[];
}
