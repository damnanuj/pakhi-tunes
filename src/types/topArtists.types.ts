import type { Pagination, PaginationParams } from "./pagination.types";

/** Single artist from the top-artists API */
export interface TopArtist {
  type: "artist";
  id: string;
  encrypted_id: string;
  perma_url: string;
  name: string;
  fansText: string;
  image: string;
}

/** Top artists API response data */
export interface TopArtistsData extends Pagination {
  results: TopArtist[];
}


/** Full top-artists API response */
export interface TopArtistsResponse {
  data: TopArtistsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

/** Query params for top-artists endpoint */
export interface TopArtistsParams extends PaginationParams {}
