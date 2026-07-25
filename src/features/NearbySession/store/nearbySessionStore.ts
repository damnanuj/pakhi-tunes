import { create } from "zustand";
import type { RepeatMode } from "src/features/Player/types";
import type {
  ActiveSession,
  NearbySession,
  SessionListener,
  SessionQueueTrack,
  SessionRole,
} from "../types/session.types";
import { clearLastConsumedRoomQueueMeta } from "../utils/roomAdvanceLock";

export type HostPlaybackAnchor = {
  positionMs: number;
  sentAt: number;
  playing: boolean;
};

type NearbySessionState = {
  nearbySessions: NearbySession[];
  isScanning: boolean;
  scanRadiusMeters: number;
  activeSession: ActiveSession | null;
  role: SessionRole;
  listenerCount: number;
  roomListeners: SessionListener[];
  roomQueue: SessionQueueTrack[];
  hostName: string | null;
  hostRepeatMode: RepeatMode;
  hostPlaybackAnchor: HostPlaybackAnchor | null;
  isConnected: boolean;
  isApplyingRemoteSync: boolean;
  locationPermission: "unknown" | "granted" | "denied";
  roomCode: string | null;
  setNearbySessions: (sessions: NearbySession[]) => void;
  setIsScanning: (scanning: boolean) => void;
  setScanRadiusMeters: (radius: number) => void;
  setActiveSession: (session: ActiveSession | null) => void;
  setRole: (role: SessionRole) => void;
  setListenerCount: (count: number) => void;
  setRoomListeners: (listeners: SessionListener[]) => void;
  setRoomQueue: (queue: SessionQueueTrack[]) => void;
  setHostName: (name: string | null) => void;
  setHostRepeatMode: (mode: RepeatMode) => void;
  setHostPlaybackAnchor: (anchor: HostPlaybackAnchor | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsApplyingRemoteSync: (applying: boolean) => void;
  setLocationPermission: (status: NearbySessionState["locationPermission"]) => void;
  setRoomCode: (code: string | null) => void;
  resetSession: () => void;
};

const initialState = {
  nearbySessions: [] as NearbySession[],
  isScanning: false,
  scanRadiusMeters: 500,
  activeSession: null as ActiveSession | null,
  role: null as SessionRole,
  listenerCount: 0,
  roomListeners: [] as SessionListener[],
  roomQueue: [] as SessionQueueTrack[],
  hostName: null as string | null,
  hostRepeatMode: "off" as RepeatMode,
  hostPlaybackAnchor: null as HostPlaybackAnchor | null,
  isConnected: false,
  isApplyingRemoteSync: false,
  locationPermission: "unknown" as const,
  roomCode: null as string | null,
};

export const useNearbySessionStore = create<NearbySessionState>((set) => ({
  ...initialState,
  setNearbySessions: (sessions) => set({ nearbySessions: sessions }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setScanRadiusMeters: (scanRadiusMeters) => set({ scanRadiusMeters }),
  setActiveSession: (activeSession) => set({ activeSession }),
  setRole: (role) => set({ role }),
  setListenerCount: (listenerCount) => set({ listenerCount }),
  setRoomListeners: (roomListeners) => set({ roomListeners }),
  setRoomQueue: (roomQueue) => set({ roomQueue }),
  setHostName: (hostName) => set({ hostName }),
  setHostRepeatMode: (hostRepeatMode) => set({ hostRepeatMode }),
  setHostPlaybackAnchor: (hostPlaybackAnchor) => set({ hostPlaybackAnchor }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsApplyingRemoteSync: (isApplyingRemoteSync) =>
    set({ isApplyingRemoteSync }),
  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setRoomCode: (roomCode) => set({ roomCode }),
  resetSession: () => {
    clearLastConsumedRoomQueueMeta();
    set({
      activeSession: null,
      role: null,
      listenerCount: 0,
      roomListeners: [],
      roomQueue: [],
      hostName: null,
      hostRepeatMode: "off",
      hostPlaybackAnchor: null,
      isApplyingRemoteSync: false,
      isConnected: false,
      roomCode: null,
    });
  },
}));

export function isListenerMode() {
  return useNearbySessionStore.getState().role === "listener";
}

export function isHostMode() {
  return useNearbySessionStore.getState().role === "host";
}
