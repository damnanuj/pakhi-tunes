import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "src/components/toast/appToastHelpers";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  addFavorite,
  removeFavorite,
} from "../services/favorites.service";
import { useLocalFavoriteActions } from "./useLocalFavorites";
import type { FavoriteSongPayload } from "../types/favorites.types";
import {
  addFavoriteToListCache,
  patchFavoriteStatusCache,
  payloadToFavoriteSong,
  removeFavoriteFromListCache,
} from "../utils/favoritesCacheUpdates";

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addFavorite: addLocalFavorite, removeFavorite: removeLocalFavorite } =
    useLocalFavoriteActions();

  const addMutation = useMutation({
    mutationFn: (payload: FavoriteSongPayload) => addFavorite(payload),
    onSuccess: (data, payload) => {
      const songId = data.songId ?? payload.songId;
      const favorite = data.favorite ?? payloadToFavoriteSong(payload);

      patchFavoriteStatusCache(queryClient, songId, true);
      addFavoriteToListCache(queryClient, favorite);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (songId: string) => removeFavorite(songId),
    onSuccess: (data) => {
      patchFavoriteStatusCache(queryClient, data.songId, false);
      removeFavoriteFromListCache(queryClient, data.songId);
    },
  });

  const toggleFavorite = useCallback(
    async (payload: FavoriteSongPayload, isFavorited: boolean) => {
      if (!isAuthenticated) {
        if (isFavorited) {
          removeLocalFavorite(payload.songId);
          appToast.removedFromFavorites(payload.title);
          return;
        }

        addLocalFavorite(payload);
        appToast.addedToFavorites(payload.title);
        return;
      }

      if (isFavorited) {
        await removeMutation.mutateAsync(payload.songId);
        appToast.removedFromFavorites(payload.title);
        return;
      }

      await addMutation.mutateAsync(payload);
      appToast.addedToFavorites(payload.title);
    },
    [
      addLocalFavorite,
      addMutation,
      isAuthenticated,
      removeLocalFavorite,
      removeMutation,
    ]
  );

  return {
    toggleFavorite,
    isAuthenticated,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
