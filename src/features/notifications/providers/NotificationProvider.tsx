import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import {
  getMessaging,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useGuestStore } from "src/features/guest/store/guestStore";
import { usePlayback } from "src/features/Player";
import { getSongById } from "src/services";
import { appToast } from "src/components/toast/appToastHelpers";
import NotificationPermissionDialog from "../components/NotificationPermissionDialog";
import {
  getFcmToken,
  useNotificationHandlers,
} from "../hooks/useNotificationHandlers";
import { registerDeviceToken } from "../services/deviceRegistration";
import {
  isNotificationPermissionGranted,
  markNotificationPromptShown,
  requestOsNotificationPermission,
  wasNotificationPromptShown,
} from "../utils/notificationPermission";
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
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const fcmTokenRef = useRef<string | null>(null);
  const registeringRef = useRef(false);
  const playingPendingRef = useRef(false);
  const closingFromAllowRef = useRef(false);
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

  const registerFcmTokenIfNeeded = useCallback(async () => {
    if (fcmTokenRef.current) {
      await syncToken({ clearUser: !isAuthenticated });
      return;
    }

    const fcmToken = await getFcmToken();
    if (!fcmToken) return;

    fcmTokenRef.current = fcmToken;
    await syncToken({ clearUser: !isAuthenticated });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

  const handlePermissionPromptNotNow = useCallback(async () => {
    await markNotificationPromptShown();
    setShowPermissionPrompt(false);
  }, []);

  const handlePermissionPromptAllow = useCallback(async () => {
    closingFromAllowRef.current = true;
    try {
      await markNotificationPromptShown();
      setShowPermissionPrompt(false);

      const granted = await requestOsNotificationPermission();
      if (granted) {
        await registerFcmTokenIfNeeded();
      }
    } finally {
      closingFromAllowRef.current = false;
    }
  }, [registerFcmTokenIfNeeded]);

  const handlePermissionPromptOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (closingFromAllowRef.current) {
          setShowPermissionPrompt(false);
          return;
        }
        void handlePermissionPromptNotNow();
        return;
      }
      setShowPermissionPrompt(true);
    },
    [handlePermissionPromptNotNow]
  );

  // Bootstrap: check permission → optional prompt → token → register
  useEffect(() => {
    if (!isAuthHydrated || !isGuestHydrated) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const granted = await isNotificationPermissionGranted();
        if (cancelled) return;

        if (!granted) {
          const prompted = await wasNotificationPromptShown();
          if (!prompted && !cancelled) {
            setShowPermissionPrompt(true);
          }
        }

        const shouldFetchToken =
          Platform.OS === "android" || granted;

        if (shouldFetchToken) {
          const fcmToken = await getFcmToken();
          if (cancelled) return;

          if (fcmToken) {
            fcmTokenRef.current = fcmToken;
            await syncToken();
          }
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

  // After enabling notifications in system settings, register token if needed
  useEffect(() => {
    if (!ready) return;

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== "active") return;

      void (async () => {
        const granted = await isNotificationPermissionGranted();
        if (!granted) return;
        await registerFcmTokenIfNeeded();
      })();
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, [ready, registerFcmTokenIfNeeded]);

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

  return (
    <>
      {children}
      <NotificationPermissionDialog
        open={showPermissionPrompt}
        onOpenChange={handlePermissionPromptOpenChange}
        onAllow={() => void handlePermissionPromptAllow()}
      />
    </>
  );
}
