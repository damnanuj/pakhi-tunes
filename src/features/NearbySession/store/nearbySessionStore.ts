import { create } from "zustand";
import type { ActiveSession, NearbySession, SessionRole } from "../types/session.types";

type NearbySessionState = {
  nearbySessions: NearbySession[];
  isScanning: boolean;
  scanRadiusMeters: number;
  activeSession: ActiveSession | null;
  role: SessionRole;
  listenerCount: number;
  hostName: string | null;
  isConnected: boolean;
  isApplyingRemoteSync: boolean;
  locationPermission: "unknown" | "granted" | "denied";
  setNearbySessions: (sessions: NearbySession[]) => void;
  setIsScanning: (scanning: boolean) => void;
  setScanRadiusMeters: (radius: number) => void;
  setActiveSession: (session: ActiveSession | null) => void;
  setRole: (role: SessionRole) => void;
  setListenerCount: (count: number) => void;
  setHostName: (name: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsApplyingRemoteSync: (applying: boolean) => void;
  setLocationPermission: (status: NearbySessionState["locationPermission"]) => void;
  resetSession: () => void;
};

const initialState = {
  nearbySessions: [] as NearbySession[],
  isScanning: false,
  scanRadiusMeters: 500,
  activeSession: null as ActiveSession | null,
  role: null as SessionRole,
  listenerCount: 0,
  hostName: null as string | null,
  isConnected: false,
  isApplyingRemoteSync: false,
  locationPermission: "unknown" as const,
};

export const useNearbySessionStore = create<NearbySessionState>((set) => ({
  ...initialState,
  setNearbySessions: (sessions) => set({ nearbySessions: sessions }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setScanRadiusMeters: (scanRadiusMeters) => set({ scanRadiusMeters }),
  setActiveSession: (activeSession) => set({ activeSession }),
  setRole: (role) => set({ role }),
  setListenerCount: (listenerCount) => set({ listenerCount }),
  setHostName: (hostName) => set({ hostName }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsApplyingRemoteSync: (isApplyingRemoteSync) =>
    set({ isApplyingRemoteSync }),
  setLocationPermission: (locationPermission) => set({ locationPermission }),
  resetSession: () =>
    set({
      activeSession: null,
      role: null,
      listenerCount: 0,
      hostName: null,
      isApplyingRemoteSync: false,
    }),
}));

export function isListenerMode() {
  return useNearbySessionStore.getState().role === "listener";
}

export function isHostMode() {
  return useNearbySessionStore.getState().role === "host";
}
