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

export interface NewReleasesMeta {
  language: string | null;
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
}

export function isNewReleaseAlbum(
  item: NewReleaseListItem
): item is NewReleaseAlbumItem {
  return item.type === "album";
}
