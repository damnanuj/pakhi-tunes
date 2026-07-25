import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  getMessaging,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useGuestStore } from "src/features/guest/store/guestStore";
import { usePlayback } from "src/features/Player";
import { getSongById } from "src/services";
import { appToast } from "src/components/toast/appToastHelpers";
import {
  getFcmToken,
  requestNotificationPermission,
  useNotificationHandlers,
} from "../hooks/useNotificationHandlers";
import { registerDeviceToken } from "../services/deviceRegistration";
import {
  getPendingNotificationAction,
  setPendingNotificationAction,
  subscribePendingNotificationAction,
} from "../utils/pendingNotificationAction";
import type { ParsedNotificationAction } from "../types";

/**
 * Owns FCM permission, token lifecycle, backend registration,
 * notification handlers, and pending play_song execution.
 */
export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isHydrated: isAuthHydrated, token } = useAuth();
  const isGuestHydrated = useGuestStore((state) => state.isHydrated);
  const [ready, setReady] = useState(false);
  const fcmTokenRef = useRef<string | null>(null);
  const registeringRef = useRef(false);
  const playingPendingRef = useRef(false);
  const { playSong } = usePlayback();

  useNotificationHandlers(ready);

  const syncToken = async (options?: { clearUser?: boolean }) => {
    if (registeringRef.current) return;
    const fcmToken = fcmTokenRef.current;
    if (!fcmToken) return;

    registeringRef.current = true;
    try {
      await registerDeviceToken(fcmToken, options);
    } catch (error) {
      console.warn("[notifications] Device registration failed", error);
    } finally {
      registeringRef.current = false;
    }
  };

  const playPendingSong = async (action: ParsedNotificationAction) => {
    if (playingPendingRef.current) return;
    if (action.actionType !== "play_song") return;

    const songId = action.actionPayload.songId;
    if (!songId) return;

    playingPendingRef.current = true;
    setPendingNotificationAction(null);

    try {
      appToast.show({
        variant: "info",
        message: "Loading song…",
        icon: "download",
        durationMs: 2000,
      });
      const song = await getSongById(songId);
      await playSong(song);
    } catch (error) {
      console.warn("[notifications] Failed to play song from notification", error);
      appToast.show({
        variant: "error",
        message: "Couldn't play the recommended song",
        icon: "trash",
      });
    } finally {
      playingPendingRef.current = false;
    }
  };

  // Bootstrap: permission → token → register
  useEffect(() => {
    if (!isAuthHydrated || !isGuestHydrated) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const granted = await requestNotificationPermission();
        if (!granted || cancelled) {
          setReady(true);
          return;
        }

        const fcmToken = await getFcmToken();
        if (cancelled) return;

        if (fcmToken) {
          fcmTokenRef.current = fcmToken;
          await syncToken();
        }
      } catch (error) {
        console.warn("[notifications] Bootstrap failed", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthHydrated, isGuestHydrated]);

  // Re-register when auth state changes (login links user; logout clears user)
  useEffect(() => {
    if (!ready || !fcmTokenRef.current) return;
    void syncToken({ clearUser: !isAuthenticated });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, ready]);

  // Token refresh listener
  useEffect(() => {
    if (!ready) return;

    const messaging = getMessaging();
    const unsubscribe = onTokenRefresh(messaging, async (newToken) => {
      fcmTokenRef.current = newToken;
      try {
        await registerDeviceToken(newToken, { clearUser: !isAuthenticated });
      } catch (error) {
        console.warn("[notifications] Token refresh registration failed", error);
      }
    });

    return unsubscribe;
  }, [ready, isAuthenticated]);

  // Process pending play_song actions after navigation
  useEffect(() => {
    const unsubscribe = subscribePendingNotificationAction((action) => {
      if (action?.actionType === "play_song") {
        setTimeout(() => {
          void playPendingSong(action);
        }, 400);
      }
    });

    const existing = getPendingNotificationAction();
    if (existing?.actionType === "play_song") {
      setTimeout(() => {
        void playPendingSong(existing);
      }, 400);
    }

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSong]);

  return <>{children}</>;
}
