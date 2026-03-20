import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import {
  Download,
  Heart,
  ListMusic,
  Pause,
  Play,
  Plus,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
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
import MockWaveformBar from "../components/MockWaveformBar";
const ART_RING_STROKE = moderateScale(2);

export default function FullPlayerPage() {
  const router = useRouter();
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
    /* mock control */
  }, []);

  if (!activeTrack) {
    return null;
  }

  const albumLine = activeTrack.albumName?.trim() || "—";
  const labelLine = activeTrack.label?.trim() || "—";

  return (
    <YStack
      flex={1}
      bg={themeColors.dark.background}
      borderWidth={1}
      borderColor="red"
    >
      <ScreenHeader title="Playing Now" showBack showSettings={false} />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: verticalScale(28),
          paddingHorizontal: scale(20),
        }}
      >
        <YStack
          flex={1}
          gap={verticalScale(20)}
          items="center"
          borderWidth={1}
          borderColor="blue"
        >
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
              color={themeColors.dark.onSurface}
              textAlign="center"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeTrack.artist}
            </MyText>
            <MyText
              fontSize={moderateScale(14)}
              weight="500"
              color={themeColors.dark.textMuted}
              textAlign="center"
              numberOfLines={1}
              ellipsizeMode="tail"
              mt={scale(4)}
            >
              {labelLine}
            </MyText>
          </YStack>

          <YStack
            gap={verticalScale(8)}
            style={{ alignSelf: "stretch" as const }}
          >
            <MockWaveformBar progress={progress} width={width} />
            <XStack justify="space-between" px={scale(4)}>
              <MyText
                fontSize={moderateScale(13)}
                weight="600"
                style={{ color: themeColors.dark.accent }}
              >
                {formatMillisToClock(playedMillis)}
              </MyText>
              <MyText
                fontSize={moderateScale(13)}
                weight="600"
                color="$textPrimary"
              >
                {formatMillisToClock(
                  durationMillis > 0
                    ? durationMillis
                    : activeTrack.durationSec * 1000
                )}
              </MyText>
            </XStack>
          </YStack>

          <XStack
            items="center"
            justify="space-between"
            style={{ alignSelf: "stretch" as const }}
            px={scale(4)}
            mt={verticalScale(8)}
          >
            <Pressable onPress={noop} hitSlop={10}>
              <Shuffle
                size={moderateScale(22)}
                color={themeColors.dark.onSurface}
              />
            </Pressable>
            <Pressable onPress={noop} hitSlop={10}>
              <SkipBack
                size={moderateScale(28)}
                color={themeColors.dark.onSurface}
              />
            </Pressable>
            <Pressable
              onPress={onPlayPause}
              style={{
                width: moderateScale(64),
                height: moderateScale(64),
                borderRadius: moderateScale(32),
                backgroundColor: themeColors.dark.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
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
            <Pressable onPress={noop} hitSlop={10}>
              <SkipForward
                size={moderateScale(28)}
                color={themeColors.dark.onSurface}
              />
            </Pressable>
            <Pressable onPress={noop} hitSlop={10}>
              <Repeat
                size={moderateScale(22)}
                color={themeColors.dark.onSurface}
              />
            </Pressable>
          </XStack>

          <XStack width="100%" gap={scale(16)} items="center">
            <XStack
              bg={themeColors.dark.surfaceSecondary}
              rounded={moderateScale(12)}
              flex={1}
              p={scale(12)}
              gap={scale(12)}
              px={scale(20)}
              items="center"
              justify="flex-start"
            >
              <Pressable
                onPress={noop}
                hitSlop={10}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: scale(4),
                }}
              >
                <ListMusic
                  size={moderateScale(22)}
                  color={themeColors.dark.onSurface}
                />
                <MyText
                  fontSize={moderateScale(12)}
                  weight="500"
                  color={themeColors.dark.onSurface}
                >
                  Queue
                </MyText>
              </Pressable>
            </XStack>

            <XStack
              flex={1}
              rounded={moderateScale(14)}
              bg={themeColors.dark.surfaceSecondary}
              p={scale(12)}
              gap={scale(12)}
              px={scale(20)}
              items="center"
              justify="flex-end"
            >
              <Pressable onPress={noop} hitSlop={10}>
                <Download
                  size={moderateScale(22)}
                  color={themeColors.dark.onSurface}
                />
              </Pressable>
              <Pressable onPress={noop} hitSlop={10}>
                <Heart
                  size={moderateScale(22)}
                  color={themeColors.dark.onSurface}
                />
              </Pressable>
            </XStack>
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
