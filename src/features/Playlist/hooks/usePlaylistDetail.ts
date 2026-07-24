import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getPlaylist } from "../services/playlist.service";
import type { PlaylistSongSort } from "../types/playlist.types";
import { DEFAULT_PLAYLIST_SONG_SORT } from "../constants/playlistSortOptions";
import {
  PLAYLISTS_STALE_TIME_MS,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

export function usePlaylistDetail(
  playlistId: string | undefined,
  sort: PlaylistSongSort = DEFAULT_PLAYLIST_SONG_SORT
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: getPlaylistDetailQueryKey(playlistId ?? "", sort),
    queryFn: () => getPlaylist(playlistId!, sort),
    enabled: isAuthenticated && Boolean(playlistId),
    staleTime: PLAYLISTS_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}
