import { createContext, useContext, type ReactNode } from "react";
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

export function NearbySessionProvider({ children }: { children: ReactNode }) {
  useHostSession();
  const { joinSession, leaveSession } = useSessionSync();

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
