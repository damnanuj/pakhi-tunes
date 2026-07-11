import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { pingGuest } from "../services/guest.service";
import { useGuestStore } from "../store/guestStore";
import { useGuestListeningStore } from "src/features/listening/store/guestListeningStore";

export default function GuestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated: isAuthHydrated } = useAuth();
  const isGuestHydrated = useGuestStore((state) => state.isHydrated);
  const ensureDeviceId = useGuestStore((state) => state.ensureDeviceId);
  const setGuestStatus = useGuestStore((state) => state.setGuestStatus);
  const pingInFlight = useRef(false);

  useEffect(() => {
    if (!isAuthHydrated || !isGuestHydrated) return;
    if (isAuthenticated) return;

    const runPing = async () => {
      const status = useGuestStore.getState().guestStatus;
      if (status === "converted" || status === "banned") return;
      if (pingInFlight.current) return;
      pingInFlight.current = true;

      try {
        const deviceId = ensureDeviceId();
        const result = await pingGuest(deviceId);

        if (result.converted) {
          setGuestStatus("converted");
          return;
        }

        if (result.guest?.status === "banned") {
          setGuestStatus("banned");
          return;
        }

        if (typeof result.totalListenedMs === "number") {
          useGuestListeningStore
            .getState()
            .setTotalListenedMs(result.totalListenedMs);
        } else if (typeof result.guest?.totalListenedMs === "number") {
          useGuestListeningStore
            .getState()
            .setTotalListenedMs(result.guest.totalListenedMs);
        }

        setGuestStatus("active");
      } catch (error) {
        console.warn("Guest ping failed", error);
      } finally {
        pingInFlight.current = false;
      }
    };

    void runPing();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void runPing();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [ensureDeviceId, isAuthHydrated, isAuthenticated, isGuestHydrated, setGuestStatus]);

  return <>{children}</>;
}
