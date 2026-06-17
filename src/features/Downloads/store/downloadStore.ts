import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  DownloadedSong,
  DownloadProgress,
} from "../types/download.types";

const STORAGE_KEY = "pakhi-downloads";

type DownloadState = {
  songs: Record<string, DownloadedSong>;
  activeDownloads: Record<string, DownloadProgress>;
  isHydrated: boolean;
  startDownload: (progress: DownloadProgress) => void;
  updateProgress: (songId: string, progress: number) => void;
  completeDownload: (song: DownloadedSong) => void;
  failDownload: (songId: string) => void;
  cancelDownload: (songId: string) => void;
  removeDownload: (songId: string) => void;
  isDownloaded: (songId: string) => boolean;
  getDownloadedSong: (songId: string) => DownloadedSong | undefined;
  getAllDownloads: () => DownloadedSong[];
  setHydrated: (value: boolean) => void;
};

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      songs: {},
      activeDownloads: {},
      isHydrated: false,
      startDownload: (progress) =>
        set((state) => ({
          activeDownloads: {
            ...state.activeDownloads,
            [progress.songId]: progress,
          },
        })),
      updateProgress: (songId, progress) =>
        set((state) => {
          const current = state.activeDownloads[songId];
          if (!current) return state;
          return {
            activeDownloads: {
              ...state.activeDownloads,
              [songId]: { ...current, progress, status: "downloading" },
            },
          };
        }),
      completeDownload: (song) =>
        set((state) => {
          const { [song.id]: _removed, ...restActive } = state.activeDownloads;
          return {
            songs: { ...state.songs, [song.id]: song },
            activeDownloads: restActive,
          };
        }),
      failDownload: (songId) =>
        set((state) => {
          const current = state.activeDownloads[songId];
          if (!current) return state;
          return {
            activeDownloads: {
              ...state.activeDownloads,
              [songId]: { ...current, status: "failed" },
            },
          };
        }),
      cancelDownload: (songId) =>
        set((state) => {
          const { [songId]: _removed, ...restActive } = state.activeDownloads;
          return { activeDownloads: restActive };
        }),
      removeDownload: (songId) =>
        set((state) => {
          const { [songId]: _removed, ...restSongs } = state.songs;
          const { [songId]: _active, ...restActive } = state.activeDownloads;
          return { songs: restSongs, activeDownloads: restActive };
        }),
      isDownloaded: (songId) => Boolean(get().songs[songId]),
      getDownloadedSong: (songId) => get().songs[songId],
      getAllDownloads: () => {
        const songs = Object.values(get().songs);
        return songs.sort((a, b) => b.downloadedAt - a.downloadedAt);
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ songs: state.songs }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const getDownloadedSong = (songId: string) =>
  useDownloadStore.getState().getDownloadedSong(songId);

export const isSongDownloaded = (songId: string) =>
  useDownloadStore.getState().isDownloaded(songId);
