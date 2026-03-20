import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
  type PressableStateCallbackType,
  type ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Download,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { usePlayback } from "../context/PlayerContext";
import { usePlayerStore } from "../store/playerStore";
import { formatMillisToClock } from "../utils/formatPlaybackTime";
import ArtworkProgressRing from "../components/ArtworkProgressRing";

const ART_RING_STROKE = moderateScale(2);

const rippleLight = { color: "rgba(255,255,255,0.12)", borderless: true };

function SimpleLineProgressBar({ progress }: { progress: number }) {
  const [trackW, setTrackW] = useState(0);
  const thumbR = moderateScale(6);
  const trackH = moderateScale(3);
  const rowH = moderateScale(22);
  const p = Math.min(1, Math.max(0, progress));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  }, []);

  const thumbLeft =
    trackW > 0
      ? Math.min(
          Math.max(0, p * trackW - thumbR),
          Math.max(0, trackW - thumbR * 2)
        )
      : 0;

  const thumbTop = rowH / 2 - thumbR;

  return (
    <View
      onLayout={onLayout}
      style={{
        alignSelf: "stretch",
        height: rowH,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          height: trackH,
          borderRadius: trackH / 2,
          backgroundColor: themeColors.dark.surface,
          borderWidth: 1,
          borderColor: themeColors.dark.borderSecondary,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${p * 100}%`,
            backgroundColor: themeColors.dark.accent,
            borderRadius: trackH / 2,
          }}
        />
      </View>
      {trackW > 0 ? (
        <View
          style={{
            position: "absolute",
            left: thumbLeft,
            top: thumbTop,
            width: thumbR * 2,
            height: thumbR * 2,
            borderRadius: thumbR,
            backgroundColor: themeColors.dark.accent,
            borderWidth: 2,
            borderColor: themeColors.dark.background,
            ...(Platform.OS === "ios"
              ? {
                  shadowColor: themeColors.dark.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.45,
                  shadowRadius: 6,
                }
              : { elevation: 4 }),
          }}
        />
      ) : null}
    </View>
  );
}

function ghostControlStyle(pressed: boolean): ViewStyle {
  return {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pressed
      ? "rgba(255,255,255,0.1)"
      : "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: pressed ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
  };
}

function IconControl({
  onPress,
  children,
}: {
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={rippleLight}
      style={({ pressed }: PressableStateCallbackType) =>
        ghostControlStyle(pressed)
      }
    >
      {children}
    </Pressable>
  );
}

const playFabShadow: ViewStyle =
  Platform.OS === "ios"
    ? {
        shadowColor: themeColors.dark.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      }
    : { elevation: 12 };

export default function FullPlayerPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { togglePlayPause } = usePlayback();

  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);

  useEffect(() => {
    if (!activeTrack) {
      router.back();
    }
  }, [activeTrack, router]);

  const progress = useMemo(() => {
    if (!durationMillis || durationMillis <= 0) return 0;
    return Math.min(1, Math.max(0, positionMillis / durationMillis));
  }, [positionMillis, durationMillis]);

  const playedMillis = useMemo(() => {
    if (!durationMillis || durationMillis <= 0) {
      return Math.max(0, positionMillis);
    }
    return Math.min(Math.max(0, positionMillis), durationMillis);
  }, [positionMillis, durationMillis]);

  const artSize = useMemo(
    () => Math.min(width * 0.64, moderateScale(286)),
    [width]
  );

  const onPlayPause = useCallback(() => {
    void togglePlayPause();
  }, [togglePlayPause]);

  const noop = useCallback(() => {
    /* secondary controls */
  }, []);

  if (!activeTrack) {
    return null;
  }

  const contextTitle =
    activeTrack.albumName?.trim() ||
    activeTrack.label?.trim() ||
    "Your library";

  const totalMillis =
    durationMillis > 0 ? durationMillis : activeTrack.durationSec * 1000;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Playing Now" showBack showSettings={false} />

      <YStack
        flex={1}
        pb={insets.bottom + verticalScale(28)}
        px={scale(20)}
        style={{ minHeight: 0 }}
      >
        <YStack
          flex={1}
          gap={verticalScale(20)}
          items="center"
          style={{ minHeight: 0 }}
        >
          <YStack items="center" gap={verticalScale(6)} px={scale(8)}>
            <MyText
              fontSize={moderateScale(11)}
              weight="600"
              color={themeColors.dark.textMuted}
              textAlign="center"
              numberOfLines={1}
              style={{
                letterSpacing: moderateScale(1.2),
                textTransform: "uppercase",
              }}
            >
              Playing from
            </MyText>
            <MyText
              fontSize={moderateScale(14)}
              weight="700"
              color={themeColors.dark.onSurface}
              textAlign="center"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ letterSpacing: moderateScale(-0.2) }}
            >
              {contextTitle}
            </MyText>
          </YStack>

          <ArtworkProgressRing
            size={artSize}
            strokeWidth={ART_RING_STROKE}
            progress={progress}
            artworkUrl={activeTrack.artworkUrl}
          />

          <YStack
            gap={scale(0)}
            px={scale(4)}
            style={{ alignSelf: "stretch" as const }}
          >
            <MyText
              fontSize={moderateScale(30)}
              weight="700"
              color={themeColors.dark.onSurface}
              textAlign="center"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeTrack.title}
            </MyText>
            <MyText
              fontSize={moderateScale(16)}
              weight="500"
              color={themeColors.dark.textMuted}
              textAlign="center"
              numberOfLines={1}
              ellipsizeMode="tail"
              mt={scale(4)}
            >
              {activeTrack.artist}
            </MyText>
          </YStack>

          <YStack
            gap={verticalScale(8)}
            style={{ alignSelf: "stretch" as const }}
          >
            <SimpleLineProgressBar progress={progress} />
            <XStack justify="space-between" px={scale(4)}>
              <MyText
                fontSize={moderateScale(13)}
                weight="600"
                color={themeColors.dark.textMuted}
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatMillisToClock(playedMillis)}
              </MyText>
              <MyText
                fontSize={moderateScale(13)}
                weight="600"
                color={themeColors.dark.textMuted}
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatMillisToClock(totalMillis)}
              </MyText>
            </XStack>
          </YStack>

          <XStack
            items="center"
            justify="space-between"
            style={{ alignSelf: "stretch" as const }}
            px={scale(2)}
            mt={verticalScale(12)}
          >
            <IconControl onPress={noop}>
              <Shuffle
                size={moderateScale(20)}
                color={themeColors.dark.onSurface}
              />
            </IconControl>
            <IconControl onPress={noop}>
              <SkipBack
                size={moderateScale(26)}
                color={themeColors.dark.onSurface}
              />
            </IconControl>
            <Pressable
              onPress={onPlayPause}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
              android_ripple={{
                color: "rgba(0,0,0,0.15)",
                foreground: true,
                borderless: false,
              }}
              style={({ pressed }: PressableStateCallbackType) => ({
                width: moderateScale(68),
                height: moderateScale(68),
                borderRadius: moderateScale(34),
                backgroundColor: themeColors.dark.accent,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.94 : 1 }],
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
                ...playFabShadow,
              })}
            >
              {isPlaying ? (
                <Pause
                  size={moderateScale(30)}
                  color={themeColors.dark.onAccent}
                  fill={themeColors.dark.onAccent}
                />
              ) : (
                <Play
                  size={moderateScale(30)}
                  color={themeColors.dark.onAccent}
                  fill={themeColors.dark.onAccent}
                  style={{ marginLeft: moderateScale(4) }}
                />
              )}
            </Pressable>
            <IconControl onPress={noop}>
              <SkipForward
                size={moderateScale(26)}
                color={themeColors.dark.onSurface}
              />
            </IconControl>
            <IconControl onPress={noop}>
              <Repeat
                size={moderateScale(20)}
                color={themeColors.dark.onSurface}
              />
            </IconControl>
          </XStack>

          <XStack
            width="100%"
            gap={scale(16)}
            items="center"
            mt="auto"
            pt={verticalScale(24)}
            px={scale(4)}
          >
            <Pressable
              onPress={noop}
              accessibilityRole="button"
              accessibilityLabel="Up next queue"
              android_ripple={rippleLight}
              style={({ pressed }: PressableStateCallbackType) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: scale(10),
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={ghostControlStyle(false)}>
                <ListMusic
                  size={moderateScale(20)}
                  color={themeColors.dark.onSurface}
                />
              </View>
              <MyText
                fontSize={moderateScale(14)}
                weight="700"
                color={themeColors.dark.onSurface}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, minWidth: 0 }}
              >
                Up next
              </MyText>
            </Pressable>

            <XStack flex={1} gap={scale(8)} items="center" justify="flex-end">
              <Pressable
                onPress={noop}
                accessibilityRole="button"
                accessibilityLabel="Download"
                android_ripple={rippleLight}
                style={({ pressed }: PressableStateCallbackType) =>
                  ghostControlStyle(pressed)
                }
              >
                <Download
                  size={moderateScale(20)}
                  color={themeColors.dark.onSurface}
                />
              </Pressable>
              <Pressable
                onPress={noop}
                accessibilityRole="button"
                accessibilityLabel="Like"
                android_ripple={rippleLight}
                style={({ pressed }: PressableStateCallbackType) =>
                  ghostControlStyle(pressed)
                }
              >
                <Heart
                  size={moderateScale(20)}
                  color={themeColors.dark.onSurface}
                />
              </Pressable>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
