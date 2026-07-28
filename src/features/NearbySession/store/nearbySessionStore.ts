import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RepeatMode } from "src/features/Player/types";
import type {
  ActiveSession,
  NearbySession,
  SessionListener,
  SessionQueueTrack,
  SessionRole,
} from "../types/session.types";
import { clearLastConsumedRoomQueueMeta } from "../utils/roomAdvanceLock";

const STORAGE_KEY = "nearby-session-room";

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
  /** Soft host-socket status — false means reconnecting, room still alive. */
  isHostConnected: boolean;
  isConnected: boolean;
  isApplyingRemoteSync: boolean;
  locationPermission: "unknown" | "granted" | "denied";
  roomCode: string | null;
  isHydrated: boolean;
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
  setIsHostConnected: (connected: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setIsApplyingRemoteSync: (applying: boolean) => void;
  setLocationPermission: (status: NearbySessionState["locationPermission"]) => void;
  setRoomCode: (code: string | null) => void;
  setHydrated: (value: boolean) => void;
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
  isHostConnected: true,
  isConnected: false,
  isApplyingRemoteSync: false,
  locationPermission: "unknown" as const,
  roomCode: null as string | null,
  isHydrated: false,
};

export const useNearbySessionStore = create<NearbySessionState>()(
  persist(
    (set) => ({
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
      setIsHostConnected: (isHostConnected) => set({ isHostConnected }),
      setIsConnected: (isConnected) => set({ isConnected }),
      setIsApplyingRemoteSync: (isApplyingRemoteSync) =>
        set({ isApplyingRemoteSync }),
      setLocationPermission: (locationPermission) => set({ locationPermission }),
      setRoomCode: (roomCode) => set({ roomCode }),
      setHydrated: (isHydrated) => set({ isHydrated }),
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
          isHostConnected: true,
          isApplyingRemoteSync: false,
          isConnected: false,
          roomCode: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Survive app kill / cold start so we can rejoin the room on launch.
      partialize: (state) => ({
        role: state.role,
        roomCode: state.roomCode,
        hostName: state.hostName,
        activeSession: state.activeSession
          ? {
              id: state.activeSession.id,
              hostId: state.activeSession.hostId,
              hostName: state.activeSession.hostName,
              hostAvatar: state.activeSession.hostAvatar ?? null,
              trackId: state.activeSession.trackId ?? "",
              trackTitle: state.activeSession.trackTitle ?? "",
              trackArtist: state.activeSession.trackArtist ?? "",
              trackArtwork: state.activeSession.trackArtwork ?? "",
              trackUri: state.activeSession.trackUri ?? "",
              trackDuration: state.activeSession.trackDuration ?? 0,
              playing: Boolean(state.activeSession.playing),
              positionMs: state.activeSession.positionMs ?? 0,
              listenerCount: state.activeSession.listenerCount ?? 0,
              visibility: state.activeSession.visibility ?? "private",
              roomCode: state.activeSession.roomCode ?? state.roomCode,
            }
          : null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function isListenerMode() {
  return useNearbySessionStore.getState().role === "listener";
}

export function isHostMode() {
  return useNearbySessionStore.getState().role === "host";
}
