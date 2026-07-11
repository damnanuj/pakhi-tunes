import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useGuestStore } from "src/features/guest/store/guestStore";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { isAnalyticsTrackingEnabled } from "src/utils/constants/analyticsTracking";
import {
  configurePresenceHeartbeat,
  endPresenceIfBackgroundAndNotPlaying,
  endPresenceSession,
  isMusicPlaying,
  setProviderPresenceHeartbeat,
  stopPresenceHeartbeats,
} from "../utils/presenceHeartbeatCoordinator";

export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated: isAuthHydrated } = useAuth();
  const isGuestHydrated = useGuestStore((state) => state.isHydrated);
  const ensureDeviceId = useGuestStore((state) => state.ensureDeviceId);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  useEffect(() => {
    if (!isAnalyticsTrackingEnabled()) return;
    if (!isAuthHydrated || !isGuestHydrated) return;

    const getDeviceId = () => ensureDeviceId();
    configurePresenceHeartbeat(getDeviceId);

    const syncProviderHeartbeatForAppState = (state: AppStateStatus) => {
      if (state === "active") {
        setProviderPresenceHeartbeat(true);
        return;
      }

      if (isMusicPlaying()) {
        setProviderPresenceHeartbeat(true);
        return;
      }

      setProviderPresenceHeartbeat(false);
      void endPresenceSession();
    };

    syncProviderHeartbeatForAppState(AppState.currentState);

    const subscription = AppState.addEventListener(
      "change",
      syncProviderHeartbeatForAppState
    );

    return () => {
      subscription.remove();
      stopPresenceHeartbeats();
      void endPresenceSession();
    };
  }, [ensureDeviceId, isAuthHydrated, isGuestHydrated]);

  useEffect(() => {
    if (!isAnalyticsTrackingEnabled()) return;
    if (!isAuthHydrated || !isGuestHydrated) return;
    if (isPlaying) return;

    void endPresenceIfBackgroundAndNotPlaying();
  }, [isAuthHydrated, isGuestHydrated, isPlaying]);

  return <>{children}</>;
}
