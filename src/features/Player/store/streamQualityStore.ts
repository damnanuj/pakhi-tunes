import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DownloadQuality } from "src/features/Downloads/types/download.types";
import type { StreamQuality } from "../constants/streamQualityOptions";
import { DEFAULT_STREAM_QUALITY } from "../constants/streamQualityOptions";

const STORAGE_KEY = "playback-preferences";
const LEGACY_STREAM_QUALITY_KEY = "stream-quality";

type PlaybackPreferencesState = {
  quality: StreamQuality;
  downloadQuality: DownloadQuality | null;
  setQuality: (quality: StreamQuality) => void;
  setDownloadQuality: (quality: DownloadQuality | null) => void;
  reset: () => void;
};

const preferencesStorage = {
  getItem: async (name: string) => {
    const current = await AsyncStorage.getItem(name);
    if (current) return current;

    const legacy = await AsyncStorage.getItem(LEGACY_STREAM_QUALITY_KEY);
    if (!legacy) return null;

    try {
      const parsed = JSON.parse(legacy) as {
        state?: { quality?: StreamQuality };
      };
      const quality = parsed?.state?.quality;
      if (!quality) return null;
      return JSON.stringify({
        state: { quality, downloadQuality: null },
        version: 0,
      });
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};

export const useStreamQualityStore = create<PlaybackPreferencesState>()(
  persist(
    (set) => ({
      quality: DEFAULT_STREAM_QUALITY,
      downloadQuality: null,
      setQuality: (quality) => set({ quality }),
      setDownloadQuality: (downloadQuality) => set({ downloadQuality }),
      reset: () =>
        set({
          quality: DEFAULT_STREAM_QUALITY,
          downloadQuality: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        quality: state.quality,
        downloadQuality: state.downloadQuality,
      }),
    }
  )
);

export const useStreamQuality = () =>
  useStreamQualityStore((state) => state.quality);

export const useDownloadQuality = () =>
  useStreamQualityStore((state) => state.downloadQuality);

export const useSetStreamQuality = () =>
  useStreamQualityStore((state) => state.setQuality);
