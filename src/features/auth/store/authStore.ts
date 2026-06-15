import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthSession, AuthUser } from "../types/auth.types";

const STORAGE_KEY = "pakhi-auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const getAuthToken = () => useAuthStore.getState().token;

export const clearAuthSession = () => useAuthStore.getState().logout();
