import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthorizationStatus,
  getMessaging,
  hasPermission,
  requestPermission,
} from "@react-native-firebase/messaging";
import { Linking, PermissionsAndroid, Platform } from "react-native";

export const NOTIFICATION_PROMPT_STORAGE_KEY =
  "pakhi.notificationPermissionPrompted";

export const NOTIFICATION_PERMISSION_TITLE = "Turn on notifications";
export const NOTIFICATION_PERMISSION_SUBTITLE = "New music, when it drops";
export const NOTIFICATION_PERMISSION_MESSAGE =
  "Get alerts for new songs, albums, and recommendations. We only send occasional updates — no spam.";

export const NOTIFICATION_DIALOG_ALLOW = "Allow";
export const NOTIFICATION_DIALOG_NOT_NOW = "Not now";

const ANDROID_POST_NOTIFICATIONS_API = 33;

function isAuthorizedStatus(status: number): boolean {
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export async function wasNotificationPromptShown(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_PROMPT_STORAGE_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function markNotificationPromptShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_STORAGE_KEY, "1");
  } catch (error) {
    console.warn("[notifications] Failed to persist prompt flag", error);
  }
}

export async function isNotificationPermissionGranted(): Promise<boolean> {
  const messaging = getMessaging();
  const status = await hasPermission(messaging);
  return isAuthorizedStatus(status);
}

async function openAppNotificationSettings(): Promise<void> {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
    return;
  }
  await Linking.openSettings();
}

/**
 * Shows the platform permission UI (after our explainer dialog).
 */
export async function requestOsNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "ios") {
    const messaging = getMessaging();
    const status = await requestPermission(messaging);
    return isAuthorizedStatus(status);
  }

  if (Platform.OS !== "android") {
    return false;
  }

  if (await isNotificationPermissionGranted()) {
    return true;
  }

  const apiLevel =
    typeof Platform.Version === "number"
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);

  if (apiLevel >= ANDROID_POST_NOTIFICATIONS_API) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  await openAppNotificationSettings();
  return isNotificationPermissionGranted();
}
