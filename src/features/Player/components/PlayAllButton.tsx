import { memo, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Pause, Play } from "@tamagui/lucide-icons";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import { useScrollBottomInset } from "src/hooks";
import { usePlayerStore } from "../store/playerStore";
import { sourcesMatch } from "../utils/queueHelpers";
import { useQueueContext } from "../context/QueueContext";
import { usePlayback } from "../context/PlayerContext";

export const PLAY_ALL_PILL_HEIGHT = moderateScale(48);
const PLAY_ALL_BOTTOM_GAP = verticalScale(20);

/** Extra list padding so the last song clears the floating pill. */
export const PLAY_ALL_LIST_CLEARANCE =
  PLAY_ALL_PILL_HEIGHT + PLAY_ALL_BOTTOM_GAP + verticalScale(8);

function PlayAllButton() {
  const queue = useQueueContext();
  const { playSongFromQueue, togglePlayPause } = usePlayback();
  const bottom = useScrollBottomInset({
    includeTabBar: true,
    extra: PLAY_ALL_BOTTOM_GAP,
  });
  const activeSource = usePlayerStore((s) => s.queueSource);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const songs = queue?.songs;
  const source = queue?.source;
  const isThisQueue = source ? sourcesMatch(activeSource, source) : false;
  const showPause = isThisQueue && isPlaying;

  const onPress = useCallback(() => {
    if (!songs || songs.length === 0 || !source) return;
    if (isThisQueue) {
      void togglePlayPause();
      return;
    }
    void playSongFromQueue(songs, 0, source);
  }, [isThisQueue, playSongFromQueue, songs, source, togglePlayPause]);

  if (!songs || songs.length === 0 || !source) return null;

  const Icon = showPause ? Pause : Play;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={showPause ? "Pause" : "Play all"}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { right: scale(20), bottom },
        pressed && styles.pressed,
      ]}
    >
      <Icon
        size={moderateScale(18)}
        color={themeColors.dark.onAccent}
        fill={themeColors.dark.onAccent}
        style={showPause ? undefined : styles.playIcon}
      />
      <MyText
        fontSize={moderateScale(15)}
        weight="700"
        color={themeColors.dark.onAccent}
      >
        {showPause ? "Pause" : "Play"}
      </MyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    zIndex: 20,
    height: PLAY_ALL_PILL_HEIGHT,
    paddingHorizontal: scale(18),
    borderRadius: PLAY_ALL_PILL_HEIGHT / 2,
    backgroundColor: themeColors.dark.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  playIcon: {
    marginLeft: moderateScale(2),
  },
});

export default memo(PlayAllButton);
