export type NotificationActionType =
  | "open_app"
  | "navigate"
  | "play_song"
  | "open_album"
  | "open_playlist"
  | "open_artist"
  | "open_url";

export type NavigateScreen =
  | "home"
  | "search"
  | "explore"
  | "settings"
  | "premium"
  | "profile"
  | "library";

export type NotificationActionPayload = {
  songId?: string;
  albumId?: string;
  playlistId?: string;
  artistId?: string;
  screen?: string;
  url?: string;
  name?: string;
  [key: string]: string | undefined;
};

export type ParsedNotificationAction = {
  messageId: string;
  notificationId?: string;
  type?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  actionType: NotificationActionType;
  actionPayload: NotificationActionPayload;
};

export type DeviceRegisterPayload = {
  installationId: string;
  fcmToken: string;
  platform: "android" | "ios" | "web";
  deviceModel?: string;
  appVersion?: string;
  clearUser?: boolean;
};
