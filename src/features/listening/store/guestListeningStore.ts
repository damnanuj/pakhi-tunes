import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { GUEST_LISTENING_LIMIT_MS } from "src/features/auth/constants/guestLimits";

const STORAGE_KEY = "pakhi-guest-listening";

type GuestListeningState = {
  totalListenedMs: number;
  isHydrated: boolean;
  setTotalListenedMs: (value: number) => void;
  addListenedMs: (deltaMs: number) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
};

export const useGuestListeningStore = create<GuestListeningState>()(
  persist(
    (set, get) => ({
      totalListenedMs: 0,
      isHydrated: false,
      setTotalListenedMs: (value) =>
        set({ totalListenedMs: Math.max(0, Math.floor(value)) }),
      addListenedMs: (deltaMs) => {
        const next = Math.max(0, get().totalListenedMs + Math.floor(deltaMs));
        set({ totalListenedMs: next });
      },
      setHydrated: (value) => set({ isHydrated: value }),
      reset: () => set({ totalListenedMs: 0 }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ totalListenedMs: state.totalListenedMs }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function getGuestRemainingListeningMs() {
  const total = useGuestListeningStore.getState().totalListenedMs;
  return Math.max(0, GUEST_LISTENING_LIMIT_MS - total);
}

export function isGuestListeningExhausted() {
  return getGuestRemainingListeningMs() <= 0;
}

export function canGuestListenMore() {
  return !isGuestListeningExhausted();
}
