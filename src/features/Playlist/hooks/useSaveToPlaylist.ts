import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ArtistSong } from "src/types/artistSongs.types";
import { appToast } from "src/components/toast/appToastHelpers";
import { artistSongToPlaylistPayload } from "../types/playlist.types";
import {
  addSongToPlaylists as addSongToPlaylistsRequest,
  getPlaylistsContainingSong,
  removeSongFromPlaylist,
} from "../services/playlist.service";
import { usePlaylists } from "./usePlaylists";
import { useAddSongToPlaylists } from "./useAddSongToPlaylists";
import { useCreatePlaylist } from "./useCreatePlaylist";
import { getRandomPlaylistCoverUrl } from "../constants/playlistCovers";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

/**
 * Selection + create orchestration for the Save-to-Playlist sheet.
 * Sheet open/close is owned by the parent.
 */
export function useSaveToPlaylist(song: ArtistSong | null, sheetOpen = false) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingMembership, setIsLoadingMembership] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const membershipRequestIdRef = useRef(0);

  const { playlists, isLoading, isError, refetch, isFetching } = usePlaylists();
  const { addSongToPlaylists, isPending: isSavingAdd } = useAddSongToPlaylists();
  const { createPlaylist, isPending: isCreating } = useCreatePlaylist();

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setInitialSelectedIds(new Set());
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
    setInitialSelectedIds(new Set());
    setDialogOpen(false);
  }, []);

  // Prefill ticks for playlists that already contain this song when sheet opens
  useEffect(() => {
    if (!sheetOpen || !song?.id) return;

    const requestId = ++membershipRequestIdRef.current;
    setIsLoadingMembership(true);

    void getPlaylistsContainingSong(song.id)
      .then((playlistIds) => {
        if (membershipRequestIdRef.current !== requestId) return;
        const next = new Set(playlistIds);
        setSelectedIds(next);
        setInitialSelectedIds(new Set(playlistIds));
      })
      .catch(() => {
        if (membershipRequestIdRef.current !== requestId) return;
        setSelectedIds(new Set());
        setInitialSelectedIds(new Set());
      })
      .finally(() => {
        if (membershipRequestIdRef.current !== requestId) return;
        setIsLoadingMembership(false);
      });
  }, [sheetOpen, song?.id]);

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

  const hasChanges = useMemo(
    () => !setsEqual(selectedIds, initialSelectedIds),
    [selectedIds, initialSelectedIds]
  );

  const isSaving = isSavingAdd || isSyncing;
  const canSubmit = hasChanges && Boolean(song) && !isSaving;

  const handleDone = useCallback(async () => {
    if (!song || !hasChanges) return;

    const toAdd = Array.from(selectedIds).filter(
      (id) => !initialSelectedIds.has(id)
    );
    const toRemove = Array.from(initialSelectedIds).filter(
      (id) => !selectedIds.has(id)
    );

    const payload = artistSongToPlaylistPayload(song);
    setIsSyncing(true);
    try {
      const tasks: Promise<unknown>[] = [];

      if (toAdd.length > 0) {
        tasks.push(
          addSongToPlaylists({
            ...payload,
            playlistIds: toAdd,
          })
        );
      }

      for (const playlistId of toRemove) {
        tasks.push(removeSongFromPlaylist(playlistId, song.id));
      }

      await Promise.all(tasks);

      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      for (const playlistId of [...toAdd, ...toRemove]) {
        void queryClient.invalidateQueries({
          queryKey: getPlaylistDetailQueryKey(playlistId),
        });
      }

      if (toAdd.length === 0 && toRemove.length > 0) {
        appToast.removedFromPlaylist(payload.title);
      }

      resetSelection();
    } finally {
      setIsSyncing(false);
    }
  }, [
    addSongToPlaylists,
    hasChanges,
    initialSelectedIds,
    queryClient,
    resetSelection,
    selectedIds,
    song,
  ]);

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
      isLoadingMembership,
      isError,
      refetch,
      isFetching,
      selectedIds,
      togglePlaylist,
      canSubmit,
      hasChanges,
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
      isLoadingMembership,
      isError,
      refetch,
      isFetching,
      selectedIds,
      togglePlaylist,
      canSubmit,
      hasChanges,
      handleDone,
      handleCreatePlaylist,
      isSaving,
      isCreating,
      clearSelection,
      resetSelection,
    ]
  );
}
