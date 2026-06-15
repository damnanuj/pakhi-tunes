import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ActiveTrack } from "src/features/Player/types";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  addFavorite,
  removeFavorite,
} from "../services/favorites.service";
import { useLocalFavoriteActions } from "./useLocalFavorites";
import {
  activeTrackToFavoritePayload,
  type FavoriteSongPayload,
} from "../types/favorites.types";
import { FAVORITES_QUERY_KEY } from "../queries/favoritesQuery";

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addFavorite: addLocalFavorite, removeFavorite: removeLocalFavorite } =
    useLocalFavoriteActions();

  const addMutation = useMutation({
    mutationFn: (payload: FavoriteSongPayload) => addFavorite(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (songId: string) => removeFavorite(songId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const toggleFavorite = useCallback(
    async (track: ActiveTrack, isFavorited: boolean) => {
      if (!isAuthenticated) {
        if (isFavorited) {
          removeLocalFavorite(track.id);
          return;
        }

        addLocalFavorite(activeTrackToFavoritePayload(track));
        return;
      }

      if (isFavorited) {
        await removeMutation.mutateAsync(track.id);
        return;
      }

      await addMutation.mutateAsync(activeTrackToFavoritePayload(track));
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
