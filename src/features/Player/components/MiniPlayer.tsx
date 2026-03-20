import { memo, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSegments } from "expo-router";
import { Pause, Play } from "@tamagui/lucide-icons";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import { moderateScale, scale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { usePlayback } from "../context/PlayerContext";
import { usePlayerStore } from "../store/playerStore";
import PlayProgressRing from "./PlayProgressRing";

const MINI_PLAYER_GAP_ABOVE_TAB = scale(6);
/** Breathing room above safe-area bottom on stack / full-screen routes */
const MINI_PLAYER_MARGIN_BOTTOM = scale(10);
const ARTWORK = moderateScale(48);
const RING = moderateScale(46);
const RING_STROKE = moderateScale(3);

function MiniPlayer() {
  const segments = useSegments();
  const { togglePlayPause } = usePlayback();

  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);

  const progress = useMemo(() => {
    if (!durationMillis || durationMillis <= 0) return 0;
    return positionMillis / durationMillis;
  }, [positionMillis, durationMillis]);

  const bottomOffset = useMemo(() => {
    const onTabs = segments[0] === "(tabs)";
    if (onTabs) {
      return TAB_BAR_HEIGHT + MINI_PLAYER_GAP_ABOVE_TAB;
    }
    return MINI_PLAYER_MARGIN_BOTTOM;
  }, [segments]);

  if (!activeTrack) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: activeTrack.artworkUrl }}
          style={styles.artwork}
          resizeMode="cover"
        />
        <View style={styles.textCol}>
          <MyText
            fontSize={moderateScale(14)}
            weight="600"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {activeTrack.title}
          </MyText>
          <MyText
            fontSize={moderateScale(12)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            {activeTrack.artist}
          </MyText>
        </View>
        <PlayProgressRing
          size={RING}
          strokeWidth={RING_STROKE}
          progress={progress}
          onPress={() => void togglePlayPause()}
        >
          {isPlaying ? (
            <Pause
              size={moderateScale(18)}
              color={themeColors.dark.onSurface}
              fill={themeColors.dark.onSurface}
            />
          ) : (
            <Play
              size={moderateScale(18)}
              color={themeColors.dark.onSurface}
              fill={themeColors.dark.onSurface}
            />
          )}
        </PlayProgressRing>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: scale(16),
    right: scale(16),
    zIndex: 1000,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(14),
    backgroundColor: themeColors.dark.surface,
    borderWidth: 1,
    borderColor: themeColors.dark.borderSecondary,
  },
  artwork: {
    width: ARTWORK,
    height: ARTWORK,
    borderRadius: moderateScale(8),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
});

export default memo(MiniPlayer);
