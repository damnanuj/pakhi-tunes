import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "src/components/toast/appToastHelpers";
import { addSongToPlaylists } from "../services/playlist.service";
import type { AddSongToPlaylistsPayload } from "../types/playlist.types";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

export function useAddSongToPlaylists() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddSongToPlaylistsPayload) =>
      addSongToPlaylists(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      for (const playlistId of variables.playlistIds) {
        void queryClient.invalidateQueries({
          queryKey: getPlaylistDetailQueryKey(playlistId),
        });
      }
    },
  });

  const addSong = useCallback(
    async (payload: AddSongToPlaylistsPayload) => {
      const result = await mutation.mutateAsync(payload);
      appToast.savedToPlaylist(payload.title);
      return result;
    },
    [mutation]
  );

  return {
    addSongToPlaylists: addSong,
    isPending: mutation.isPending,
  };
}
