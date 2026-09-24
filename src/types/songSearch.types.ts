import type { ArtistSong } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";
import type { NewReleaseAlbumItem } from "./newReleases.types";

export interface SearchArtistItem {
  id: string;
  encrypted_id: string;
  name: string;
  image: string;
  type?: "artist";
}

export interface SongSearchData extends Pagination {
  results: ArtistSong[];
  albums?: NewReleaseAlbumItem[];
  artists?: SearchArtistItem[];
}

export interface SongSearchResponse {
  data: SongSearchData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface SongSearchParams extends PaginationParams {
  q: string;
}
