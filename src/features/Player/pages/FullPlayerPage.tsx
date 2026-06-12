import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
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
  Repeat1,
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
import { getQueueSourceLabel, hasNext, hasQueue } from "../utils/queueHelpers";
import ArtworkProgressRing from "../components/ArtworkProgressRing";
import UpNextSheet from "../components/UpNextSheet";

const ART_RING_STROKE = moderateScale(3);

const rippleLight = { color: "rgba(255,255,255,0.12)", borderless: true };

function SimpleLineProgressBar({
  progress,
  durationMillis,
  onSeek,
}: {
  progress: number;
  durationMillis: number;
  onSeek: (millis: number) => void | Promise<void>;
}) {
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const scrubProgressRef = useRef(0);

  const thumbR = moderateScale(6);
  const trackH = moderateScale(5);
  const rowH = moderateScale(22);
  const hitH = moderateScale(44);
  const seekable = durationMillis > 0;

  const p = Math.min(
    1,
    Math.max(0, isScrubbing ? scrubProgress : progress)
  );

  const progressFromLocationX = useCallback((x: number) => {
    const w = trackWRef.current;
    if (w <= 0) return 0;
    return Math.min(1, Math.max(0, x / w));
  }, []);

  const finishScrub = useCallback(
    (x?: number) => {
      if (!seekable) return;
      const nextP =
        x !== undefined
          ? progressFromLocationX(x)
          : scrubProgressRef.current;
      void Promise.resolve(onSeek(nextP * durationMillis)).finally(() => {
        setIsScrubbing(false);
      });
    },
    [durationMillis, onSeek, progressFromLocationX, seekable]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => seekable,
        onMoveShouldSetPanResponder: () => seekable,
        onPanResponderGrant: (e) => {
          if (!seekable) return;
          const nextP = progressFromLocationX(e.nativeEvent.locationX);
          scrubProgressRef.current = nextP;
          setIsScrubbing(true);
          setScrubProgress(nextP);
        },
        onPanResponderMove: (e) => {
          if (!seekable) return;
          const nextP = progressFromLocationX(e.nativeEvent.locationX);
          scrubProgressRef.current = nextP;
          setScrubProgress(nextP);
        },
        onPanResponderRelease: (e) => {
          finishScrub(e.nativeEvent.locationX);
        },
        onPanResponderTerminate: () => {
          finishScrub();
        },
      }),
    [finishScrub, progressFromLocationX, seekable]
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    setTrackW(w);
  }, []);

  const thumbLeft =
    trackW > 0
      ? Math.min(
          Math.max(0, p * trackW - thumbR),
          Math.max(0, trackW - thumbR * 2)
        )
      : 0;

  const thumbTop = rowH / 2 - thumbR;
  const thumbCenterX = p * trackW;
  const tooltipPadH = moderateScale(10);
  const tooltipPadV = moderateScale(5);
  const scrubMillis = Math.round(scrubProgress * durationMillis);
  const tooltipMinW = moderateScale(52);

  const tooltipLeft =
    trackW > 0
      ? Math.min(
          Math.max(0, thumbCenterX - tooltipMinW / 2),
          Math.max(0, trackW - tooltipMinW)
        )
      : 0;

  return (
    <View
      onLayout={onLayout}
      style={{
        alignSelf: "stretch",
        height: hitH,
        justifyContent: "center",
      }}
      {...(seekable ? panResponder.panHandlers : {})}
    >
      <View
        style={{
          height: rowH,
          justifyContent: "center",
        }}
      >
        {isScrubbing && trackW > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: tooltipLeft,
              bottom: rowH + verticalScale(6),
              minWidth: tooltipMinW,
              paddingHorizontal: tooltipPadH,
              paddingVertical: tooltipPadV,
              borderRadius: moderateScale(8),
              backgroundColor: themeColors.dark.surface,
              borderWidth: 1,
              borderColor: themeColors.dark.borderSecondary,
              alignItems: "center",
              justifyContent: "center",
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.35,
                    shadowRadius: 4,
                  }
                : { elevation: 6 }),
            }}
          >
            <MyText
              fontSize={moderateScale(13)}
              weight="700"
              color={themeColors.dark.onSurface}
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatMillisToClock(scrubMillis)}
            </MyText>
          </View>
        ) : null}
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
            pointerEvents="none"
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
  disabled = false,
}: {
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      android_ripple={disabled ? undefined : rippleLight}
      style={({ pressed }: PressableStateCallbackType) => ({
        ...ghostControlStyle(pressed && !disabled),
        opacity: disabled ? 0.35 : 1,
      })}
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
  const {
    togglePlayPause,
    seekToMillis,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlayback();

  const seekGenerationRef = useRef(0);
  const [isSeekInProgress, setIsSeekInProgress] = useState(false);
  const [isUpNextOpen, setIsUpNextOpen] = useState(false);

  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isPlaybackLoading = usePlayerStore((s) => s.isPlaybackLoading);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const queueSource = usePlayerStore((s) => s.queueSource);
  const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled);
  const repeatMode = usePlayerStore((s) => s.repeatMode);

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
    () => Math.min(width * 0.68, moderateScale(300)),
    [width]
  );

  const onPlayPause = useCallback(() => {
    void togglePlayPause();
  }, [togglePlayPause]);

  const handleSeekToMillis = useCallback(
    async (millis: number) => {
      const gen = ++seekGenerationRef.current;
      setIsSeekInProgress(true);
      try {
        await seekToMillis(millis);
      } finally {
        if (seekGenerationRef.current === gen) {
          setIsSeekInProgress(false);
        }
      }
    },
    [seekToMillis]
  );

  const onSkipPrevious = useCallback(() => {
    void skipToPrevious();
  }, [skipToPrevious]);

  const onSkipNext = useCallback(() => {
    void skipToNext();
  }, [skipToNext]);

  const onToggleShuffle = useCallback(() => {
    toggleShuffle();
  }, [toggleShuffle]);

  const onCycleRepeat = useCallback(() => {
    cycleRepeatMode();
  }, [cycleRepeatMode]);

  const onOpenUpNext = useCallback(() => {
    setIsUpNextOpen(true);
  }, []);

  const noop = useCallback(() => {
    /* download / like placeholders */
  }, []);

  if (!activeTrack) {
    return null;
  }

  const queueState = { queue, queueIndex, queueSource, repeatMode };
  const canSkipNext = hasNext(queueState);
  const canOpenUpNext = hasQueue(queueState);

  const contextTitle = queueSource
    ? getQueueSourceLabel(queueSource)
    : activeTrack.albumName?.trim() ||
      activeTrack.label?.trim() ||
      "Your library";

  const accent = themeColors.dark.accent;
  const onSurface = themeColors.dark.onSurface;
  const muted = themeColors.dark.textMuted;

  const totalMillis =
    durationMillis > 0 ? durationMillis : activeTrack.durationSec * 1000;

  const showMainFabSpinner = isPlaybackLoading || isSeekInProgress;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Playing Now" showBack showSettings={false} />

      <YStack
        flex={1}
        pb={insets.bottom + verticalScale(22)}
        px={scale(20)}
        style={{ minHeight: 0 }}
      >
        <YStack
          flex={1}
          gap={verticalScale(14)}
          items="center"
          style={{ minHeight: 0 }}
        >
          <YStack items="center" gap={verticalScale(4)} px={scale(8)}>
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
              mt={scale(3)}
            >
              {activeTrack.artist}
            </MyText>
          </YStack>

          <YStack
            gap={verticalScale(6)}
            style={{ alignSelf: "stretch" as const }}
          >
            <SimpleLineProgressBar
              progress={progress}
              durationMillis={totalMillis}
              onSeek={handleSeekToMillis}
            />
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
            mt={verticalScale(8)}
          >
            <IconControl onPress={onToggleShuffle} disabled={!canOpenUpNext}>
              <Shuffle
                size={moderateScale(20)}
                color={shuffleEnabled && canOpenUpNext ? accent : onSurface}
              />
            </IconControl>
            <IconControl onPress={onSkipPrevious}>
              <SkipBack size={moderateScale(26)} color={onSurface} />
            </IconControl>
            <Pressable
              disabled={showMainFabSpinner}
              onPress={onPlayPause}
              accessibilityRole="button"
              accessibilityLabel={
                showMainFabSpinner ? "Loading" : isPlaying ? "Pause" : "Play"
              }
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
                opacity: showMainFabSpinner ? 0.85 : 1,
                ...playFabShadow,
              })}
            >
              {showMainFabSpinner ? (
                <ActivityIndicator
                  color={themeColors.dark.onAccent}
                  size="large"
                />
              ) : isPlaying ? (
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
            <IconControl onPress={onSkipNext} disabled={!canSkipNext}>
              <SkipForward
                size={moderateScale(26)}
                color={canSkipNext ? onSurface : muted}
              />
            </IconControl>
            <IconControl onPress={onCycleRepeat}>
              {repeatMode === "one" ? (
                <Repeat1 size={moderateScale(20)} color={accent} />
              ) : (
                <Repeat
                  size={moderateScale(20)}
                  color={repeatMode === "all" ? accent : onSurface}
                />
              )}
            </IconControl>
          </XStack>

          <XStack
            width="100%"
            gap={scale(16)}
            items="center"
            mt="auto"
            pt={verticalScale(16)}
            px={scale(4)}
          >
            <Pressable
              disabled={!canOpenUpNext}
              onPress={canOpenUpNext ? onOpenUpNext : undefined}
              accessibilityRole="button"
              accessibilityLabel="Up next queue"
              accessibilityState={{ disabled: !canOpenUpNext }}
              android_ripple={canOpenUpNext ? rippleLight : undefined}
              style={({ pressed }: PressableStateCallbackType) => ({
                flex: 1,
                minWidth: 0,
                opacity: !canOpenUpNext ? 0.35 : pressed ? 0.85 : 1,
              })}
            >
              <XStack gap={scale(10)} items="center" style={{ minWidth: 0 }}>
                <View style={ghostControlStyle(false)}>
                  <ListMusic
                    size={moderateScale(20)}
                    color={
                      canOpenUpNext ? themeColors.dark.onSurface : muted
                    }
                  />
                </View>
                <MyText
                  fontSize={moderateScale(14)}
                  weight="700"
                  color={canOpenUpNext ? themeColors.dark.onSurface : muted}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  Up next
                </MyText>
              </XStack>
            </Pressable>

            <XStack
              flex={1}
              gap={scale(8)}
              items="center"
              justify="flex-end"
            >
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
      {canOpenUpNext ? (
        <UpNextSheet open={isUpNextOpen} onOpenChange={setIsUpNextOpen} />
      ) : null}
    </YStack>
  );
}
