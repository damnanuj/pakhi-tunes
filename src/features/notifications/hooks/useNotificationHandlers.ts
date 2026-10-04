import { useCallback, useEffect, useRef } from "react";
import { AppState, NativeModules, Platform } from "react-native";
import {
  getInitialNotification,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  registerDeviceForRemoteMessages,
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { useRouter } from "expo-router";
import {
  parseNotificationData,
  routeNotificationAction,
} from "../utils/notificationRouter";
import { isDuplicateNotification } from "../utils/notificationDedupe";
import { setPendingNotificationAction } from "../utils/pendingNotificationAction";
import {
  actionFromDisplayedNotification,
  consumeQueuedNotificationPress,
  displaySystemNotification,
} from "../utils/systemNotification";
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

    const openDisplayedNotification = (
      notification:
        | {
            data?: Record<string, string | number | object> | null;
            title?: string | null;
            body?: string | null;
          }
        | undefined
    ) => {
      const action = actionFromDisplayedNotification(notification);
      if (!action) return;
      void handleNotificationOpen(action, router);
    };

    // Foreground FCM is not shown by Android. Post it to the notification panel.
    const unsubscribeForeground = onMessage(messaging, async (remoteMessage) => {
      const action = remoteMessageToAction(remoteMessage);
      if (!action) return;

      if (isDuplicateNotification(`fg-${action.messageId}`)) {
        return;
      }

      try {
        await displaySystemNotification(remoteMessage);
      } catch (error) {
        console.warn("[notifications] Failed to display system notification", error);
      }
    });

    let unsubscribePress = () => {};
    if (NativeModules.NotifeeApiModule != null) {
      const notifee = require("@notifee/react-native") as typeof import("@notifee/react-native");
      unsubscribePress = notifee.default.onForegroundEvent(({ type, detail }) => {
        if (type !== notifee.EventType.PRESS) return;
        openDisplayedNotification(detail.notification);
      });
    }

    const consumeQueuedPress = () => {
      void consumeQueuedNotificationPress().then((queued) => {
        if (!queued) return;
        openDisplayedNotification(queued);
      });
    };
    consumeQueuedPress();
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") consumeQueuedPress();
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
      unsubscribePress();
      appStateSubscription.remove();
    };
  }, [enabled, onOpen, router]);
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
