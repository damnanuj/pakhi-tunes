import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StreamQuality } from "../constants/streamQualityOptions";
import { DEFAULT_STREAM_QUALITY } from "../constants/streamQualityOptions";

const STORAGE_KEY = "stream-quality";

type StreamQualityState = {
  quality: StreamQuality;
  setQuality: (quality: StreamQuality) => void;
};

export const useStreamQualityStore = create<StreamQualityState>()(
  persist(
    (set) => ({
      quality: DEFAULT_STREAM_QUALITY,
      setQuality: (quality) => set({ quality }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ quality: state.quality }),
    }
  )
);

export const useStreamQuality = () =>
  useStreamQualityStore((state) => state.quality);

export const useSetStreamQuality = () =>
  useStreamQualityStore((state) => state.setQuality);
