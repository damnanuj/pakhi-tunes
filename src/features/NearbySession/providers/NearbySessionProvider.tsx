import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { ENV } from "src/utils/constants/env";
import { appToast } from "src/components/toast/appToastHelpers";
import { useHostSession } from "../hooks/useHostSession";
import { usePrivateRoomHost } from "../hooks/usePrivateRoomHost";
import { useSessionSync } from "../hooks/useSessionSync";
import { fetchSessionByCode, stopHostSession } from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { ActiveSession, NearbySession } from "../types/session.types";

type NearbySessionContextValue = {
  joinSession: (session: NearbySession) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  createRoom: () => Promise<ActiveSession | null>;
  stopRoom: () => Promise<void>;
  joinByCode: (code: string) => Promise<boolean>;
};

const NearbySessionContext = createContext<NearbySessionContextValue | null>(
  null
);

function warmupSocketServer() {
  if (!ENV.SOCKET_URL) return;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);
  void fetch(`${ENV.SOCKET_URL}/health`, { signal: controller.signal }).finally(
    () => clearTimeout(timeoutId)
  );
}

async function stopHostingIfNeeded() {
  const state = useNearbySessionStore.getState();
  if (state.role !== "host") return;

  const sessionId = state.activeSession?.id;
  if (sessionId) {
    sessionSocketService.emitHostStop();
    try {
      await stopHostSession(sessionId);
    } catch {
      /* ignore */
    }
  }
  useNearbySessionStore.getState().resetSession();
}

export function NearbySessionProvider({ children }: { children: ReactNode }) {
  useHostSession();
  const { joinSession, leaveSession } = useSessionSync();
  const { createRoom, stopRoom } = usePrivateRoomHost();

  const joinByCode = useCallback(
    async (code: string) => {
      const normalized = code.trim();
      if (!/^\d{4}$/.test(normalized)) {
        appToast.error("Enter a valid 4-digit room code");
        return false;
      }

      try {
        await stopHostingIfNeeded();
        const session = await fetchSessionByCode(normalized);
        return joinSession(session);
      } catch {
        appToast.error("Room not found");
        return false;
      }
    },
    [joinSession]
  );

  useEffect(() => {
    warmupSocketServer();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") warmupSocketServer();
    };

    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <NearbySessionContext.Provider
      value={{ joinSession, leaveSession, createRoom, stopRoom, joinByCode }}
    >
      {children}
    </NearbySessionContext.Provider>
  );
}

export function useNearbySessionActions() {
  const ctx = useContext(NearbySessionContext);
  if (!ctx) {
    throw new Error(
      "useNearbySessionActions must be used within NearbySessionProvider"
    );
  }
  return ctx;
}
