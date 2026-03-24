import { memo, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
} from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import { Pause, Play } from "@tamagui/lucide-icons";
import { View, XStack, YStack } from "tamagui";
import { MINI_PLAYER_Z_INDEX, TAB_BAR_HEIGHT } from "src/constants/tabBar";
import {
  moderateScale,
  scale,
  SCREEN_HEIGHT,
  verticalScale,
} from "src/utils/functions/dimensions";
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
/** Swipe-down distance (px) to dismiss the mini player and stop playback. */
const SWIPE_DOWN_DISMISS_THRESHOLD = verticalScale(48);
const DISMISS_SLIDE_DURATION_MS = 320;
const SPRING_BACK_FRICTION = 8;
const SPRING_BACK_TENSION = 90;

function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();
  const { togglePlayPause, stopPlaybackAndClear } = usePlayback();

  const dismissSwipeRef = useRef(stopPlaybackAndClear);
  dismissSwipeRef.current = stopPlaybackAndClear;

  const translateY = useRef(new Animated.Value(0)).current;
  const activeTrackId = usePlayerStore((s) => s.activeTrack?.id);

  useEffect(() => {
    translateY.setValue(0);
  }, [activeTrackId, translateY]);

  const panelOpacity = useMemo(
    () =>
      translateY.interpolate({
        inputRange: [0, verticalScale(120), SCREEN_HEIGHT],
        outputRange: [1, 0.94, 0],
        extrapolate: "clamp",
      }),
    [translateY]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 12 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderTerminationRequest: () => true,
      onPanResponderMove: (_, gs) => {
        translateY.setValue(Math.max(0, gs.dy));
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > SWIPE_DOWN_DISMISS_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: DISMISS_SLIDE_DURATION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) void dismissSwipeRef.current();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: SPRING_BACK_FRICTION,
            tension: SPRING_BACK_TENSION,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
        zIndex: MINI_PLAYER_Z_INDEX,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY }],
          opacity: panelOpacity,
        }}
        {...panResponder.panHandlers}
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
      </Animated.View>
    </View>
  );
}

/**
 * Renders the mini player when the active route is not under `(tabs)`.
 * When on tabs, the mini player is mounted inside `app/(tabs)/_layout.tsx` after the
 * scene but before `BottomTabBar` so dismiss swipe slides the bar behind the tab bar.
 */
export function MiniPlayerRootLayer() {
  const segments = useSegments();
  if (segments[0] === "(tabs)") return null;
  return <MiniPlayer />;
}

export default memo(MiniPlayer);
