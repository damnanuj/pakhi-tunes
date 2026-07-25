import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  registerDeviceForRemoteMessages,
  requestPermission,
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { useRouter } from "expo-router";
import { appToast } from "src/components/toast/appToastHelpers";
import {
  parseNotificationData,
  routeNotificationAction,
} from "../utils/notificationRouter";
import { isDuplicateNotification } from "../utils/notificationDedupe";
import { setPendingNotificationAction } from "../utils/pendingNotificationAction";
import type { ParsedNotificationAction } from "../types";

function getFcmMessaging() {
  return getMessaging();
}

function remoteMessageToAction(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): ParsedNotificationAction | null {
  const data = remoteMessage.data as Record<string, string> | undefined;
  return parseNotificationData(data, {
    messageId: remoteMessage.messageId ?? undefined,
    title: remoteMessage.notification?.title ?? undefined,
    body: remoteMessage.notification?.body ?? undefined,
  });
}

async function handleNotificationOpen(
  action: ParsedNotificationAction,
  router: ReturnType<typeof useRouter>
) {
  if (isDuplicateNotification(action.messageId)) {
    return;
  }

  if (action.actionType === "play_song" && action.actionPayload.songId) {
    setPendingNotificationAction(action);
  }

  try {
    await routeNotificationAction(action, router);
  } catch (error) {
    console.warn("[notifications] Failed to route notification", error);
  }
}

/**
 * Sets up foreground message display and notification-tap handling
 * for background / quit states.
 */
export function useNotificationHandlers(enabled: boolean) {
  const router = useRouter();
  const handledInitial = useRef(false);

  const onOpen = useCallback(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (!remoteMessage) return;
      const action = remoteMessageToAction(remoteMessage);
      if (!action) return;
      await handleNotificationOpen(action, router);
    },
    [router]
  );

  useEffect(() => {
    if (!enabled) return;

    const messaging = getFcmMessaging();

    // Foreground messages — show in-app toast (system banner suppressed on iOS by default)
    const unsubscribeForeground = onMessage(messaging, async (remoteMessage) => {
      const action = remoteMessageToAction(remoteMessage);
      if (!action) return;

      if (isDuplicateNotification(`fg-${action.messageId}`)) {
        return;
      }

      const title = action.title ?? "Pakhi Tunes";
      const body = action.body ?? "";

      appToast.show({
        variant: "info",
        message: body ? `${title}\n${body}` : title,
        icon: "check",
        durationMs: 5000,
      });
    });

    // App opened from background via notification tap
    const unsubscribeOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      void onOpen(remoteMessage);
    });

    // App opened from quit state via notification tap
    if (!handledInitial.current) {
      handledInitial.current = true;
      void getInitialNotification(messaging).then((remoteMessage) =>
        onOpen(remoteMessage)
      );
    }

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [enabled, onOpen]);
}

/**
 * Request notification permission. Returns whether permission is granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const messaging = getFcmMessaging();
  const authStatus = await requestPermission(messaging);

  if (Platform.OS === "ios") {
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  return (
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL ||
    // On older Android, permission is granted by default
    Platform.OS === "android"
  );
}

/**
 * Get the current FCM token (returns null if unavailable).
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const messaging = getFcmMessaging();

    // iOS requires registration for remote messages
    if (
      Platform.OS === "ios" &&
      !isDeviceRegisteredForRemoteMessages(messaging)
    ) {
      await registerDeviceForRemoteMessages(messaging);
    }

    const token = await getToken(messaging);
    return token?.trim() ? token : null;
  } catch (error) {
    console.warn("[notifications] Failed to get FCM token", error);
    return null;
  }
}
