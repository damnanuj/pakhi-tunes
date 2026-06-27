import { useEffect } from "react";
import { Image, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Headphones, LogOut, Play, Users } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import type { NearbySession } from "../types/session.types";

type NearbySessionCardProps = {
  session: NearbySession;
  onJoin: (session: NearbySession) => void;
  onLeave?: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  isActiveSession?: boolean;
  listenerCountOverride?: number;
};

function formatDistance(meters?: number) {
  if (meters === undefined) return "";
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function LiveDot({ playing }: { playing: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!playing) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, [playing, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: moderateScale(6),
          height: moderateScale(6),
          borderRadius: moderateScale(3),
          backgroundColor: playing
            ? themeColors.dark.accent
            : themeColors.dark.textMuted,
        },
        playing ? dotStyle : undefined,
      ]}
    />
  );
}

export default function NearbySessionCard({
  session,
  onJoin,
  onLeave,
  isJoining = false,
  isLeaving = false,
  isActiveSession = false,
  listenerCountOverride,
}: NearbySessionCardProps) {
  const isLeaveMode = isActiveSession;
  const isBusy = isJoining || isLeaving;
  const distance = formatDistance(session.distanceMeters);
  const listenerCount = listenerCountOverride ?? session.listenerCount;

  return (
    <YStack
      overflow="hidden"
      rounded={moderateScale(18)}
      borderWidth={1}
      borderColor={
        isActiveSession
          ? themeColors.dark.accent
          : themeColors.dark.borderSecondary
      }
      bg={themeColors.dark.surfaceSecondary}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: scale(84),
        }}
      >
        <Image
          source={{ uri: session.trackArtwork }}
          style={{ width: "100%", height: "100%", opacity: 0.22 }}
          blurRadius={2}
        />
      </View>

      <XStack items="center" gap={scale(12)} p={scale(12)}>
        <View
          style={{
            width: moderateScale(56),
            height: moderateScale(56),
            borderRadius: moderateScale(12),
            overflow: "hidden",
            borderWidth: isActiveSession ? 2 : 1,
            borderColor: isActiveSession
              ? themeColors.dark.accent
              : themeColors.dark.borderSecondary,
          }}
        >
          <Image
            source={{ uri: session.trackArtwork }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        <YStack flex={1} gap={verticalScale(4)} pl={scale(12)} style={{ minWidth: 0 }}>
          <XStack items="center" justify="space-between" gap={scale(8)}>
            <XStack
              items="center"
              gap={scale(5)}
              px={scale(8)}
              py={verticalScale(3)}
              rounded={moderateScale(10)}
              bg={themeColors.dark.surface}
              borderWidth={1}
              borderColor={themeColors.dark.borderSecondary}
              style={{ maxWidth: "58%" }}
            >
              {session.hostAvatar ? (
                <Image
                  source={{ uri: session.hostAvatar }}
                  style={{
                    width: moderateScale(16),
                    height: moderateScale(16),
                    borderRadius: moderateScale(8),
                  }}
                />
              ) : (
                <Headphones
                  size={moderateScale(12)}
                  color={themeColors.dark.accent}
                />
              )}
              <MyText
                fontSize={moderateScale(11)}
                weight="700"
                color={themeColors.dark.onSurface}
                numberOfLines={1}
              >
                {session.hostName}
              </MyText>
            </XStack>

            <XStack items="center" gap={scale(4)}>
              <LiveDot playing={session.playing} />
              <MyText
                fontSize={moderateScale(10)}
                weight="700"
                color={
                  session.playing
                    ? themeColors.dark.accent
                    : themeColors.dark.textMuted
                }
                style={{ letterSpacing: moderateScale(0.4) }}
              >
                {session.playing ? "LIVE" : "PAUSED"}
              </MyText>
            </XStack>
          </XStack>

          <MyText
            fontSize={moderateScale(14)}
            weight="700"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {session.trackTitle}
          </MyText>

          <XStack items="center" gap={scale(6)} style={{ minWidth: 0 }}>
            <MyText
              fontSize={moderateScale(12)}
              weight="500"
              color={themeColors.dark.textMuted}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {session.trackArtist}
            </MyText>
            {distance ? (
              <>
                <MyText
                  fontSize={moderateScale(12)}
                  color={themeColors.dark.textMuted}
                >
                  ·
                </MyText>
                <MyText
                  fontSize={moderateScale(12)}
                  weight="500"
                  color={themeColors.dark.textMuted}
                >
                  {distance}
                </MyText>
              </>
            ) : null}
            <XStack items="center" gap={scale(3)} ml="auto">
              <Users
                size={moderateScale(12)}
                color={themeColors.dark.textMuted}
              />
              <MyText
                fontSize={moderateScale(11)}
                weight="600"
                color={themeColors.dark.textMuted}
              >
                {listenerCount}
              </MyText>
            </XStack>
          </XStack>
        </YStack>

        <Pressable
          onPress={() => (isLeaveMode ? onLeave?.() : onJoin(session))}
          disabled={isBusy}
          style={{
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(22),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isLeaveMode
              ? "transparent"
              : themeColors.dark.accent,
            borderWidth: isLeaveMode ? 1 : 0,
            borderColor: isLeaveMode
              ? themeColors.dark.borderSecondary
              : "transparent",
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          {isLeaveMode ? (
            isLeaving ? (
              <MyText
                fontSize={moderateScale(9)}
                weight="700"
                color={themeColors.dark.accent}
              >
                ...
              </MyText>
            ) : (
              <LogOut
                size={moderateScale(18)}
                color={themeColors.dark.accent}
              />
            )
          ) : isJoining ? (
            <MyText
              fontSize={moderateScale(9)}
              weight="700"
              color={themeColors.dark.onAccent}
            >
              ...
            </MyText>
          ) : (
            <Play
              size={moderateScale(18)}
              color={themeColors.dark.onAccent}
              fill={themeColors.dark.onAccent}
              style={{ marginLeft: moderateScale(2) }}
            />
          )}
        </Pressable>
      </XStack>
    </YStack>
  );
}
