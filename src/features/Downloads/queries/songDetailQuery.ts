import { getSongById } from "src/services/songDetail.service";
import type { ArtistSong } from "src/types/artistSongs.types";
import { queryClient } from "src/utils/query/queryClient";

export const SONG_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;

export function songDetailQueryKey(id: string) {
  return ["songDetail", id] as const;
}

export function getSongDetailQueryOptions(id: string) {
  return {
    queryKey: songDetailQueryKey(id),
    queryFn: () => getSongById(id),
    staleTime: SONG_DETAIL_STALE_TIME_MS,
  };
}

export function fetchSongDetail(id: string): Promise<ArtistSong> {
  return queryClient.fetchQuery(getSongDetailQueryOptions(id));
}
