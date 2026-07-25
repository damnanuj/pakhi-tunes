import type { Router } from "expo-router";
import type {
  NotificationActionPayload,
  NotificationActionType,
  ParsedNotificationAction,
} from "../types";

type RouterLike = Pick<Router, "push" | "replace">;

type ActionHandler = (
  payload: NotificationActionPayload,
  router: RouterLike
) => void | Promise<void>;

const SCREEN_ROUTES: Record<string, string> = {
  home: "/(tabs)/home",
  search: "/(tabs)/explore",
  explore: "/(tabs)/explore",
  library: "/(tabs)/library",
  profile: "/(tabs)/profile",
  settings: "/(tabs)/profile",
  premium: "/(tabs)/profile",
};

/**
 * Extensible action registry (Open/Closed).
 * Add new action types here without changing existing handlers.
 */
const actionHandlers: Record<string, ActionHandler> = {
  open_app: (_payload, router) => {
    router.replace("/(tabs)/home");
  },

  navigate: (payload, router) => {
    const screen = (payload.screen ?? "home").toLowerCase();
    const route = SCREEN_ROUTES[screen] ?? "/(tabs)/home";
    router.push(route as never);
  },

  play_song: (payload, router) => {
    // Navigation to player; actual playback is handled by pending action processor
    if (payload.songId) {
      router.push("/player" as never);
    } else {
      router.replace("/(tabs)/home");
    }
  },

  open_album: (payload, router) => {
    if (!payload.albumId) {
      router.replace("/(tabs)/home");
      return;
    }
    router.push({
      pathname: "/home/album/[id]",
      params: { id: payload.albumId },
    } as never);
  },

  open_playlist: (payload, router) => {
    if (!payload.playlistId) {
      router.replace("/(tabs)/library");
      return;
    }
    const name = payload.name ? `?name=${encodeURIComponent(payload.name)}` : "";
    router.push(`/library/playlist/${payload.playlistId}${name}` as never);
  },

  open_artist: (payload, router) => {
    if (!payload.artistId) {
      router.replace("/(tabs)/home");
      return;
    }
    router.push({
      pathname: "/home/top-artists/[id]",
      params: {
        id: payload.artistId,
        ...(payload.name ? { name: payload.name } : {}),
      },
    } as never);
  },

  open_url: async (payload) => {
    if (!payload.url) return;
    const { openExternalUrl } = await import("src/utils/linking/openExternalUrl");
    await openExternalUrl(payload.url);
  },
};

/**
 * Register a custom action handler (for future notification types).
 */
export function registerNotificationAction(
  actionType: string,
  handler: ActionHandler
) {
  actionHandlers[actionType] = handler;
}

/**
 * Parse FCM remote message data into a typed action.
 */
export function parseNotificationData(
  data: Record<string, string> | undefined,
  options?: { messageId?: string; title?: string; body?: string }
): ParsedNotificationAction | null {
  if (!data && !options?.title) return null;

  const actionType = (data?.actionType ?? "open_app") as NotificationActionType;
  const actionPayload: NotificationActionPayload = {};

  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (
        key === "actionType" ||
        key === "notificationId" ||
        key === "type" ||
        key === "imageUrl"
      ) {
        continue;
      }
      if (typeof value === "string") {
        actionPayload[key] = value;
      }
    }
  }

  return {
    messageId: options?.messageId ?? data?.notificationId ?? `${Date.now()}`,
    notificationId: data?.notificationId,
    type: data?.type,
    title: options?.title,
    body: options?.body,
    imageUrl: data?.imageUrl,
    actionType,
    actionPayload,
  };
}

/**
 * Route a parsed notification action through the central registry.
 */
export async function routeNotificationAction(
  action: ParsedNotificationAction,
  router: RouterLike
): Promise<void> {
  const handler = actionHandlers[action.actionType] ?? actionHandlers.open_app;
  await handler(action.actionPayload, router);
}

export { SCREEN_ROUTES };
