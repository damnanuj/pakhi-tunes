import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./service";

TrackPlayer.registerPlaybackService(() => PlaybackService);

// FCM background handler must be registered at the top level (outside React).
// System still displays the notification; this keeps the JS runtime awake briefly.
try {
  const {
    getMessaging,
    setBackgroundMessageHandler,
  } = require("@react-native-firebase/messaging");
  setBackgroundMessageHandler(getMessaging(), async () => {
    // No-op: display is handled by FCM notification payload.
    // Deep-link routing happens on notification open via onNotificationOpenedApp /
    // getInitialNotification in NotificationProvider.
  });
} catch (error) {
  console.warn("[notifications] Failed to register background handler", error);
}

import "expo-router/entry";
