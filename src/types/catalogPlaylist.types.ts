import type { ArtistSong, ArtistSongImage } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";

export interface CatalogPlaylistDetail {
  id: string;
  name: string;
  subtitle: string;
  image: ArtistSongImage[];
  songCount: number;
  type: "playlist";
}

export interface CatalogPlaylistSongsData extends Pagination {
  playlist: CatalogPlaylistDetail;
  results: ArtistSong[];
}

export interface CatalogPlaylistSongsResponse {
  data: CatalogPlaylistSongsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface CatalogPlaylistSongsParams extends PaginationParams {}
