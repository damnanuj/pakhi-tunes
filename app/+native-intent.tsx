/**
 * Rewrites third-party deep links before Expo Router resolves them.
 * Android media-notification taps from react-native-track-player open
 * `trackplayer://notification.click`, which would otherwise hit +not-found.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    const url = new URL(path, "pakhitunes://");
    const isNotificationClick =
      url.protocol === "trackplayer:" ||
      path.includes("notification.click") ||
      url.hostname === "notification.click";

    if (isNotificationClick) {
      return "/player";
    }

    return path;
  } catch {
    if (path.includes("notification.click")) {
      return "/player";
    }
    return path;
  }
}
