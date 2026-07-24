import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PlaylistSongSort } from "../types/playlist.types";
import { DEFAULT_PLAYLIST_SONG_SORT } from "../constants/playlistSortOptions";

const STORAGE_KEY = "playlist-song-sort";

type PlaylistSortState = {
  sort: PlaylistSongSort;
  setSort: (sort: PlaylistSongSort) => void;
};

export const usePlaylistSortStore = create<PlaylistSortState>()(
  persist(
    (set) => ({
      sort: DEFAULT_PLAYLIST_SONG_SORT,
      setSort: (sort) => set({ sort }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sort: state.sort }),
    }
  )
);

export const usePlaylistSongSort = () =>
  usePlaylistSortStore((state) => state.sort);

export const useSetPlaylistSongSort = () =>
  usePlaylistSortStore((state) => state.setSort);
