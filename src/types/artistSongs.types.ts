import type { Pagination, PaginationParams } from "./pagination.types";

/** Image object from API */
export interface ArtistSongImage {
  quality: string;
  url: string;
}

/** Artist detail from artist songs API (header/profile) */
export interface ArtistDetail {
  id: string;
  encrypted_id: string;
  name: string;
  url: string;
  image: ArtistSongImage[];
  fanCount: number | null;
  followerCount: number;
  dob: string;
  isVerified: boolean;
  dominantLanguage: string;
  dominantType: string;
  bio: unknown[];
  wiki: string;
}

/** Artist reference in song */
export interface ArtistSongArtist {
  id: string;
  name: string;
  role: string;
  image: ArtistSongImage[];
  type: string;
  url: string;
}

/** Song artists container */
export interface ArtistSongArtists {
  primary: ArtistSongArtist[];
  featured: ArtistSongArtist[];
  all: ArtistSongArtist[];
}

/** Album reference in song */
export interface ArtistSongAlbum {
  id: string;
  name: string;
  url: string;
}

/** Single song from artist songs API */
export interface ArtistSong {
  id: string;
  encrypted_id: string;
  name: string;
  type: string;
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  explicitContent: boolean;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  lyricsId: string;
  lyrics: string | null;
  url: string;
  copyright: string;
  album: ArtistSongAlbum;
  artists: ArtistSongArtists;
  image: ArtistSongImage[];
  downloadUrl?: { quality: string; url: string }[];
}

/** Artist songs API response data */
export interface ArtistSongsData extends Pagination {
  artist?: ArtistDetail;
  results: ArtistSong[];
}

/** Full artist songs API response */
export interface ArtistSongsResponse {
  data: ArtistSongsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

/** Query params for artist songs endpoint */
export interface ArtistSongsParams extends PaginationParams {}
