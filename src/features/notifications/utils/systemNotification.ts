import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { NativeModules, Platform } from "react-native";
import type { ParsedNotificationAction } from "../types";
import { parseNotificationData } from "./notificationRouter";

const CHANNEL_ID = "pakhi-updates";
const QUEUE_KEY = "pakhi.queuedNotificationPress";

type NotifeePackage = typeof import("@notifee/react-native");

type NotificationContent = {
  data?: Record<string, string | number | object> | null;
  title?: string | null;
  body?: string | null;
};

type QueuedPress = {
  data?: Record<string, string>;
  title?: string;
  body?: string;
};

let notifeePackage: NotifeePackage | null | undefined;
let channelPromise: Promise<void> | null = null;

function getNotifee(): NotifeePackage | null {
  if (notifeePackage !== undefined) return notifeePackage;
  if (NativeModules.NotifeeApiModule == null) {
    notifeePackage = null;
    return null;
  }
  notifeePackage = require("@notifee/react-native") as NotifeePackage;
  return notifeePackage;
}

function stringData(
  data: FirebaseMessagingTypes.RemoteMessage["data"] | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data) return out;
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function imageUrlFromMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): string | undefined {
  const dataUrl = remoteMessage.data?.imageUrl;
  const androidUrl = remoteMessage.notification?.android?.imageUrl;
  const url =
    (typeof dataUrl === "string" && dataUrl.trim()) ||
    (typeof androidUrl === "string" && androidUrl.trim()) ||
    "";
  if (!/^https?:\/\//i.test(url)) return undefined;
  return url;
}

function notificationId(messageId?: string) {
  const raw = messageId && messageId.length > 0 ? messageId : `${Date.now()}`;
  const safe = raw.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 64);
  return safe || `${Date.now()}`;
}

async function ensureAndroidChannel(notifee: NotifeePackage) {
  if (Platform.OS !== "android") return;
  if (!channelPromise) {
    channelPromise = notifee.default
      .createChannel({
        id: CHANNEL_ID,
        name: "Notifications",
        importance: notifee.AndroidImportance.HIGH,
        visibility: notifee.AndroidVisibility.PUBLIC,
        vibration: true,
        sound: "default",
      })
      .then(() => undefined)
      .catch((error: unknown) => {
        channelPromise = null;
        throw error;
      });
  }
  await channelPromise;
}

/**
 * Android does not show an FCM notification in the shade while the app is
 * open. Post the same message as a system notification instead.
 */
export async function displaySystemNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<boolean> {
  const notifee = getNotifee();
  if (!notifee) {
    console.warn(
      "[notifications] Cannot show a system notification until the dev client is rebuilt with Notifee."
    );
    return false;
  }

  const data = stringData(remoteMessage.data);
  if (remoteMessage.messageId && !data.messageId) {
    data.messageId = remoteMessage.messageId;
  }

  const title = remoteMessage.notification?.title ?? data.title ?? "Pakhi Tunes";
  const body = remoteMessage.notification?.body ?? data.body ?? "";
  const imageUrl = imageUrlFromMessage(remoteMessage);

  await ensureAndroidChannel(notifee);

  await notifee.default.displayNotification({
    id: notificationId(remoteMessage.messageId),
    title,
    body,
    data,
    android: {
      channelId: CHANNEL_ID,
      importance: notifee.AndroidImportance.HIGH,
      visibility: notifee.AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      sound: "default",
      ...(imageUrl
        ? {
            largeIcon: imageUrl,
            style: {
              type: notifee.AndroidStyle.BIGPICTURE,
              picture: imageUrl,
            },
          }
        : {}),
    },
    ios: {
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
      sound: "default",
      ...(imageUrl ? { attachments: [{ url: imageUrl }] } : {}),
    },
  });

  return true;
}

export function actionFromDisplayedNotification(
  notification: NotificationContent | undefined
): ParsedNotificationAction | null {
  if (!notification) return null;

  const data: Record<string, string> = {};
  if (notification.data) {
    for (const [key, value] of Object.entries(notification.data)) {
      if (typeof value === "string") data[key] = value;
      else if (typeof value === "number") data[key] = String(value);
    }
  }

  return parseNotificationData(data, {
    messageId: data.messageId,
    title: notification.title ?? undefined,
    body: notification.body ?? undefined,
  });
}

export async function queueNotificationPress(press: QueuedPress) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(press));
  } catch (error) {
    console.warn("[notifications] Failed to queue notification press", error);
  }
}

export async function consumeQueuedNotificationPress(): Promise<QueuedPress | null> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(QUEUE_KEY);
    return JSON.parse(raw) as QueuedPress;
  } catch (error) {
    console.warn("[notifications] Failed to read queued notification press", error);
    return null;
  }
}

/** Must be registered at startup, outside React. No-op until Notifee is in the binary. */
export function registerNotificationBackgroundHandler() {
  const notifee = getNotifee();
  if (!notifee) return;

  notifee.default.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== notifee.EventType.PRESS) return;
    const notification = detail.notification;
    if (!notification) return;

    const data: Record<string, string> = {};
    if (notification.data) {
      for (const [key, value] of Object.entries(notification.data)) {
        if (typeof value === "string") data[key] = value;
      }
    }

    await queueNotificationPress({
      data,
      title: notification.title,
      body: notification.body,
    });
  });
}
