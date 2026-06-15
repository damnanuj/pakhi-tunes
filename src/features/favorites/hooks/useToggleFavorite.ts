import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ActiveTrack } from "src/features/Player/types";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useRequireAuth } from "src/features/auth/hooks/useRequireAuth";
import {
  addFavorite,
  removeFavorite,
} from "../services/favorites.service";
import {
  activeTrackToFavoritePayload,
  type FavoriteSongPayload,
} from "../types/favorites.types";
import { FAVORITES_QUERY_KEY } from "./useFavorites";

export function useToggleFavorite(redirectPath = "/player") {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useRequireAuth(redirectPath);

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
      if (!requireAuth()) return;

      if (isFavorited) {
        await removeMutation.mutateAsync(track.id);
        return;
      }

      await addMutation.mutateAsync(activeTrackToFavoritePayload(track));
    },
    [addMutation, removeMutation, requireAuth]
  );

  return {
    toggleFavorite,
    isAuthenticated,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
