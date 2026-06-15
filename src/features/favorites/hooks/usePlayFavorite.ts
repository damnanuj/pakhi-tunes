import { useCallback, useState } from "react";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import type { FavoriteSong } from "../types/favorites.types";
import { resolveFavoriteTrack } from "../utils/resolveFavoriteTrack";

export function usePlayFavorite() {
  const { playActiveTrack, togglePlayPause } = usePlayback();
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const [resolvingSongId, setResolvingSongId] = useState<string | null>(null);

  const isResolving = useCallback(
    (songId: string) => resolvingSongId === songId,
    [resolvingSongId]
  );

  const playFavorite = useCallback(
    async (favorite: FavoriteSong) => {
      const isActive = activeTrack?.id === favorite.songId;

      if (isActive) {
        void togglePlayPause();
        return;
      }

      if (resolvingSongId) return;

      setResolvingSongId(favorite.songId);
      try {
        const track = await resolveFavoriteTrack(favorite);
        if (!track) {
          console.warn("Unable to play favourite", favorite.songId);
          return;
        }
        await playActiveTrack(track);
      } catch (error) {
        console.warn("Failed to play favourite", favorite.songId, error);
      } finally {
        setResolvingSongId(null);
      }
    },
    [activeTrack?.id, playActiveTrack, resolvingSongId, togglePlayPause]
  );

  return {
    playFavorite,
    resolvingSongId,
    isResolving,
  };
}
