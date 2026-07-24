import { useQuery } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getPlaylist } from "../services/playlist.service";
import {
  PLAYLISTS_STALE_TIME_MS,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

export function usePlaylistDetail(playlistId: string | undefined) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: getPlaylistDetailQueryKey(playlistId ?? ""),
    queryFn: () => getPlaylist(playlistId!),
    enabled: isAuthenticated && Boolean(playlistId),
    staleTime: PLAYLISTS_STALE_TIME_MS,
  });
}
