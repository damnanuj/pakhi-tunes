import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useGuestStore } from "src/features/guest/store/guestStore";
import { endPresence, heartbeatPresence } from "../services/presence.service";

const HEARTBEAT_INTERVAL_MS = 45_000;

export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated: isAuthHydrated } = useAuth();
  const isGuestHydrated = useGuestStore((state) => state.isHydrated);
  const ensureDeviceId = useGuestStore((state) => state.ensureDeviceId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatInFlight = useRef(false);

  useEffect(() => {
    if (!isAuthHydrated || !isGuestHydrated) return;

    const getDeviceId = () => ensureDeviceId();

    const runHeartbeat = async () => {
      if (heartbeatInFlight.current) return;
      heartbeatInFlight.current = true;
      try {
        await heartbeatPresence(getDeviceId());
      } catch (error) {
        console.warn("Presence heartbeat failed", error);
      } finally {
        heartbeatInFlight.current = false;
      }
    };

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startHeartbeat = () => {
      stopHeartbeat();
      void runHeartbeat();
      intervalRef.current = setInterval(() => {
        void runHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    };

    const runEnd = () => {
      stopHeartbeat();
      void endPresence(getDeviceId()).catch((error) => {
        console.warn("Presence end failed", error);
      });
    };

    if (AppState.currentState === "active") {
      startHeartbeat();
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        startHeartbeat();
        return;
      }
      runEnd();
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      runEnd();
    };
  }, [ensureDeviceId, isAuthHydrated, isGuestHydrated]);

  return <>{children}</>;
}
