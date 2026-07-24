import { createContext, useContext, useEffect, type ReactNode } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { ENV } from "src/utils/constants/env";
import { useHostSession } from "../hooks/useHostSession";
import { useSessionSync } from "../hooks/useSessionSync";
import type { NearbySession } from "../types/session.types";

type NearbySessionContextValue = {
  joinSession: (session: NearbySession) => Promise<boolean>;
  leaveSession: () => Promise<void>;
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

export function NearbySessionProvider({ children }: { children: ReactNode }) {
  useHostSession();
  const { joinSession, leaveSession } = useSessionSync();

  useEffect(() => {
    warmupSocketServer();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") warmupSocketServer();
    };

    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <NearbySessionContext.Provider value={{ joinSession, leaveSession }}>
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
