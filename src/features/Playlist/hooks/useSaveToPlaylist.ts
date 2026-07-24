import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ArtistSong } from "src/types/artistSongs.types";
import { artistSongToPlaylistPayload } from "../types/playlist.types";
import { addSongToPlaylists as addSongToPlaylistsRequest } from "../services/playlist.service";
import { usePlaylists } from "./usePlaylists";
import { useAddSongToPlaylists } from "./useAddSongToPlaylists";
import { useCreatePlaylist } from "./useCreatePlaylist";
import { getRandomPlaylistCoverUrl } from "../constants/playlistCovers";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

/**
 * Selection + create orchestration for the Save-to-Playlist sheet.
 * Sheet open/close is owned by the parent.
 */
export function useSaveToPlaylist(song: ArtistSong | null) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { playlists, isLoading, isError, refetch, isFetching } = usePlaylists();
  const { addSongToPlaylists, isPending: isSaving } = useAddSongToPlaylists();
  const { createPlaylist, isPending: isCreating } = useCreatePlaylist();

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
    setDialogOpen(false);
  }, []);

  const togglePlaylist = useCallback((playlistId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playlistId)) {
        next.delete(playlistId);
      } else {
        next.add(playlistId);
      }
      return next;
    });
  }, []);

  const canSubmit = selectedIds.size > 0 && Boolean(song) && !isSaving;

  const handleDone = useCallback(async () => {
    if (!song || selectedIds.size === 0) return;
    const payload = artistSongToPlaylistPayload(song);
    await addSongToPlaylists({
      ...payload,
      playlistIds: Array.from(selectedIds),
    });
    resetSelection();
  }, [addSongToPlaylists, resetSelection, selectedIds, song]);

  const openNewPlaylistDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCreatePlaylist = useCallback(
    async (name: string, coverUrl?: string) => {
      if (!song) return;
      const playlist = await createPlaylist({
        name,
        coverUrl: coverUrl || getRandomPlaylistCoverUrl(),
      });
      const payload = artistSongToPlaylistPayload(song);
      await addSongToPlaylistsRequest({
        ...payload,
        playlistIds: [playlist.id],
      });
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: getPlaylistDetailQueryKey(playlist.id),
      });
      resetSelection();
    },
    [createPlaylist, queryClient, resetSelection, song]
  );

  return useMemo(
    () => ({
      dialogOpen,
      setDialogOpen,
      openNewPlaylistDialog,
      playlists,
      isLoading,
      isError,
      refetch,
      isFetching,
      selectedIds,
      togglePlaylist,
      canSubmit,
      selectedCount: selectedIds.size,
      handleDone,
      handleCreatePlaylist,
      isSaving,
      isCreating,
      clearSelection,
      resetSelection,
    }),
    [
      dialogOpen,
      openNewPlaylistDialog,
      playlists,
      isLoading,
      isError,
      refetch,
      isFetching,
      selectedIds,
      togglePlaylist,
      canSubmit,
      handleDone,
      handleCreatePlaylist,
      isSaving,
      isCreating,
      clearSelection,
      resetSelection,
    ]
  );
}
