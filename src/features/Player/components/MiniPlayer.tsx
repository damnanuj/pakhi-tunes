import { memo, useMemo } from "react";
import { ActivityIndicator, Image, Pressable } from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import { Pause, Play } from "@tamagui/lucide-icons";
import { View, XStack, YStack } from "tamagui";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import { moderateScale, scale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { usePlayback } from "../context/PlayerContext";
import { usePlayerStore } from "../store/playerStore";
import {
  MINI_PLAYER_GAP_ABOVE_TAB,
  MINI_PLAYER_MARGIN_BOTTOM,
  MINI_PLAYER_RING,
} from "../miniPlayerLayout";
import { formatMillisToClock } from "../utils/formatPlaybackTime";
import PlayProgressRing from "./PlayProgressRing";

const RING_STROKE = moderateScale(3);

function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();
  const { togglePlayPause } = usePlayback();

  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isPlaybackLoading = usePlayerStore((s) => s.isPlaybackLoading);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);

  const progress = useMemo(() => {
    if (!durationMillis || durationMillis <= 0) return 0;
    return positionMillis / durationMillis;
  }, [positionMillis, durationMillis]);

  const playedMillis = useMemo(() => {
    if (!durationMillis || durationMillis <= 0) {
      return Math.max(0, positionMillis);
    }
    return Math.min(Math.max(0, positionMillis), durationMillis);
  }, [positionMillis, durationMillis]);

  const bottomOffset = useMemo(() => {
    const onTabs = segments[0] === "(tabs)";
    if (onTabs) {
      return TAB_BAR_HEIGHT + MINI_PLAYER_GAP_ABOVE_TAB;
    }
    return MINI_PLAYER_MARGIN_BOTTOM;
  }, [segments]);

  if (!activeTrack) return null;
  /** Full-screen player has its own controls; do not stack the mini bar on top. */
  if (pathname === "/player") return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: scale(16),
        right: scale(16),
        bottom: bottomOffset,
        zIndex: 1000,
      }}
    >
      <XStack
        items="center"
        gap={scale(12)}
        py={scale(10)}
        px={scale(10)}
        rounded={moderateScale(14)}
        bg={themeColors.dark.surface}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
      >
        <Pressable
          onPress={() => router.push("/player")}
          style={{ flex: 1, minWidth: 0 }}
        >
          <XStack items="center" gap={scale(12)} flex={1} style={{ minWidth: 0 }}>
            <View
              rounded={moderateScale(8)}
              overflow="hidden"
              style={{ alignSelf: "stretch", aspectRatio: 1 }}
            >
              <Image
                source={{ uri: activeTrack.artworkUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <YStack flex={1} justify="center" style={{ minWidth: 0 }}>
              <MyText
                fontSize={moderateScale(14)}
                weight="600"
                color="$textPrimary"
                numberOfLines={1}
              >
                {activeTrack.title}
              </MyText>
              <MyText
                fontSize={moderateScale(12)}
                weight="500"
                color="$textSecondary"
                numberOfLines={1}
              >
                {activeTrack.artist}
              </MyText>
              {durationMillis > 0 ? (
                <XStack
                  items="center"
                  justify="space-between"
                  mt={scale(4)}
                  pr={scale(2)}
                >
                  <MyText
                    fontSize={moderateScale(11)}
                    weight="600"
                    color="$textSecondary"
                    numberOfLines={1}
                  >
                    {formatMillisToClock(playedMillis)}
                  </MyText>
                  <MyText
                    fontSize={moderateScale(11)}
                    weight="500"
                    color="$textSecondary"
                    numberOfLines={1}
                  >
                    {formatMillisToClock(durationMillis)}
                  </MyText>
                </XStack>
              ) : null}
            </YStack>
          </XStack>
        </Pressable>
        <PlayProgressRing
          size={MINI_PLAYER_RING}
          strokeWidth={RING_STROKE}
          progress={isPlaybackLoading ? 0 : progress}
          onPress={() => {
            if (isPlaybackLoading) return;
            void togglePlayPause();
          }}
        >
          {isPlaybackLoading ? (
            <ActivityIndicator
              color={themeColors.dark.accent}
              size="small"
            />
          ) : isPlaying ? (
            <Pause
              size={moderateScale(18)}
              color={themeColors.dark.accent}
              fill={themeColors.dark.accent}
            />
          ) : (
            <Play
              size={moderateScale(18)}
              color={themeColors.dark.accent}
              fill={themeColors.dark.accent}
            />
          )}
        </PlayProgressRing>
      </XStack>
    </View>
  );
}

export default memo(MiniPlayer);
