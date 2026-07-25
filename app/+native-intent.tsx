/**
 * Rewrites third-party deep links before Expo Router resolves them.
 * Android media-notification taps from react-native-track-player open
 * `trackplayer://notification.click`, which would otherwise hit +not-found.
 *
 * Also supports pakhitunes://notification deep links for FCM payloads
 * delivered via URL scheme (future / web).
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    const url = new URL(path, "pakhitunes://");
    const isTrackPlayerClick =
      url.protocol === "trackplayer:" ||
      path.includes("notification.click") ||
      url.hostname === "notification.click";

    if (isTrackPlayerClick) {
      return "/player";
    }

    // pakhitunes://notification?actionType=play_song&songId=...
    if (url.hostname === "notification" || url.pathname === "/notification") {
      const actionType = url.searchParams.get("actionType") ?? "open_app";
      if (actionType === "play_song" && url.searchParams.get("songId")) {
        return "/player";
      }
      if (actionType === "open_album" && url.searchParams.get("albumId")) {
        return `/home/album/${url.searchParams.get("albumId")}`;
      }
      if (actionType === "open_playlist" && url.searchParams.get("playlistId")) {
        return `/library/playlist/${url.searchParams.get("playlistId")}`;
      }
      if (actionType === "open_artist" && url.searchParams.get("artistId")) {
        return `/home/top-artists/${url.searchParams.get("artistId")}`;
      }
      if (actionType === "navigate") {
        const screen = (url.searchParams.get("screen") ?? "home").toLowerCase();
        const map: Record<string, string> = {
          home: "/(tabs)/home",
          search: "/(tabs)/explore",
          explore: "/(tabs)/explore",
          library: "/(tabs)/library",
          profile: "/(tabs)/profile",
        };
        return map[screen] ?? "/(tabs)/home";
      }
      return "/(tabs)/home";
    }

    return path;
  } catch {
    if (path.includes("notification.click")) {
      return "/player";
    }
    return path;
  }
}
