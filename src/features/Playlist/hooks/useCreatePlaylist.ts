import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "src/components/toast/appToastHelpers";
import { createPlaylist } from "../services/playlist.service";
import type { CreatePlaylistPayload, Playlist } from "../types/playlist.types";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";
import { DEFAULT_PLAYLIST_SONG_SORT } from "../constants/playlistSortOptions";

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePlaylistPayload) => createPlaylist(payload),
    onSuccess: (playlist: Playlist) => {
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      queryClient.setQueryData(
        getPlaylistDetailQueryKey(playlist.id, DEFAULT_PLAYLIST_SONG_SORT),
        playlist
      );
    },
  });

  const create = useCallback(
    async (payload: CreatePlaylistPayload) => {
      const playlist = await mutation.mutateAsync(payload);
      appToast.playlistCreated(playlist.name);
      return playlist;
    },
    [mutation]
  );

  return {
    createPlaylist: create,
    isPending: mutation.isPending,
  };
}
