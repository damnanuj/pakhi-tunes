import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "pakhi-guest-device";

export type GuestLocalStatus = "active" | "converted" | "banned" | null;

type GuestState = {
  deviceId: string | null;
  guestStatus: GuestLocalStatus;
  isHydrated: boolean;
  ensureDeviceId: () => string;
  setGuestStatus: (status: GuestLocalStatus) => void;
  markConverted: () => void;
  setHydrated: (value: boolean) => void;
};

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      deviceId: null,
      guestStatus: null,
      isHydrated: false,
      ensureDeviceId: () => {
        const existing = get().deviceId;
        if (existing) return existing;

        const nextId = Crypto.randomUUID();
        set({ deviceId: nextId });
        return nextId;
      },
      setGuestStatus: (status) => set({ guestStatus: status }),
      markConverted: () => set({ guestStatus: "converted" }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deviceId: state.deviceId,
        guestStatus: state.guestStatus,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const getGuestDeviceId = () => useGuestStore.getState().ensureDeviceId();
export const markGuestConverted = () => useGuestStore.getState().markConverted();
