import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  FavoriteSongPayload,
  LocalFavorite,
} from "../types/favorites.types";

const STORAGE_KEY = "pakhi-local-favorites";

type LocalFavoritesState = {
  favorites: Record<string, LocalFavorite>;
  addFavorite: (payload: FavoriteSongPayload) => void;
  removeFavorite: (songId: string) => void;
  getAll: () => LocalFavorite[];
  clearAll: () => void;
};

export const useLocalFavoritesStore = create<LocalFavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      addFavorite: (payload) => {
        const songId = payload.songId.trim();
        if (!songId) return;

        set((state) => ({
          favorites: {
            ...state.favorites,
            [songId]: {
              ...payload,
              songId,
              savedAt: Date.now(),
            },
          },
        }));
      },
      removeFavorite: (songId) => {
        const trimmed = songId.trim();
        if (!trimmed) return;

        set((state) => {
          const { [trimmed]: _removed, ...rest } = state.favorites;
          return { favorites: rest };
        });
      },
      getAll: () => {
        const favorites = Object.values(get().favorites);
        return favorites.sort((a, b) => b.savedAt - a.savedAt);
      },
      clearAll: () => set({ favorites: {} }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
