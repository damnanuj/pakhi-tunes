import { useEffect } from "react";
import { View } from "react-native";
import { Radio } from "@tamagui/lucide-icons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import type { NearbySession } from "../types/session.types";

const RADAR_SIZE = moderateScale(260);
const PULSE_COUNT = 3;

function PulseRing({ delay, active }: { delay: number; active: boolean }) {
  const scaleValue = useSharedValue(0.3);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    if (!active) {
      scaleValue.value = 0.3;
      opacity.value = 0;
      return;
    }

    scaleValue.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(1.15, { duration: 2400, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.65, { duration: 0 }),
          withTiming(0, { duration: 2400, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      )
    );
  }, [active, delay, opacity, scaleValue]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacity.value,
  }));

  if (!active) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: RADAR_SIZE,
          height: RADAR_SIZE,
          borderRadius: RADAR_SIZE / 2,
          borderWidth: 2,
          borderColor: themeColors.dark.accent,
        },
        style,
      ]}
    />
  );
}

function HostDot({
  session,
  index,
  total,
  active,
}: {
  session: NearbySession;
  index: number;
  total: number;
  active: boolean;
}) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radius = RADAR_SIZE * 0.34;
  const left = RADAR_SIZE / 2 + Math.cos(angle) * radius - moderateScale(8);
  const top = RADAR_SIZE / 2 + Math.sin(angle) * radius - moderateScale(8);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, [active, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left,
          top,
          width: moderateScale(16),
          height: moderateScale(16),
          borderRadius: moderateScale(8),
          backgroundColor: themeColors.dark.accent,
          borderWidth: 2,
          borderColor: themeColors.dark.onAccent,
        },
        dotStyle,
      ]}
      accessibilityLabel={`${session.hostName} listening to ${session.trackTitle}`}
    />
  );
}

function ScanningDot({ active }: { active: boolean }) {
  const opacity = useSharedValue(active ? 1 : 0.35);

  useEffect(() => {
    if (!active) {
      opacity.value = 0.35;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.25, { duration: 600 })
      ),
      -1,
      true
    );
  }, [active, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!active) return null;

  return (
    <Animated.View
      style={[
        {
          width: moderateScale(7),
          height: moderateScale(7),
          borderRadius: moderateScale(4),
          backgroundColor: themeColors.dark.accent,
        },
        style,
      ]}
    />
  );
}

function ScanEmptyState({ discoverable }: { discoverable: boolean }) {
  return (
    <XStack
      items="center"
      justify="center"
      gap={scale(6)}
      py={verticalScale(8)}
      px={scale(14)}
      rounded={moderateScale(12)}
      bg={themeColors.dark.surfaceSecondary}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
    >
      <Radio size={moderateScale(14)} color={themeColors.dark.textMuted} />
      <MyText
        fontSize={moderateScale(13)}
        weight="600"
        color={themeColors.dark.textMuted}
      >
        No sessions nearby yet
      </MyText>
    </XStack>
  );
}

type RadarScanViewProps = {
  sessions: NearbySession[];
  isScanning: boolean;
  discoverable?: boolean;
};

export default function RadarScanView({
  sessions,
  isScanning,
  discoverable = true,
}: RadarScanViewProps) {
  const rotate = useSharedValue(0);
  const isActive = discoverable;

  useEffect(() => {
    if (!isActive) {
      rotate.value = 0;
      return;
    }
    rotate.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, [isActive, rotate]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const hasSessions = sessions.length > 0;
  const statusText = discoverable
    ? "Scanning nearby sessions…"
    : "Nearby listening is off";

  return (
    <YStack items="center" gap={verticalScale(14)} width="100%">
      <View
        style={{
          width: RADAR_SIZE,
          height: RADAR_SIZE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: RADAR_SIZE,
            height: RADAR_SIZE,
            borderRadius: RADAR_SIZE / 2,
            backgroundColor: themeColors.dark.surface,
            borderWidth: 1,
            borderColor: themeColors.dark.borderSecondary,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            opacity: discoverable ? 1 : 0.75,
          }}
        >
          {Array.from({ length: PULSE_COUNT }).map((_, i) => (
            <PulseRing key={i} delay={i * 800} active={isActive} />
          ))}

          {isActive ? (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: RADAR_SIZE / 2,
                  height: RADAR_SIZE / 2,
                  left: RADAR_SIZE / 2,
                  top: RADAR_SIZE / 2,
                  transformOrigin: "left top",
                  borderTopWidth: 2,
                  borderTopColor: "rgba(255,255,255,0.35)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
                sweepStyle,
              ]}
            />
          ) : null}

          <View
            style={{
              width: moderateScale(56),
              height: moderateScale(56),
              borderRadius: moderateScale(28),
              backgroundColor: discoverable
                ? themeColors.dark.accent
                : themeColors.dark.surfaceSecondary,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              borderWidth: discoverable ? 0 : 1,
              borderColor: themeColors.dark.borderSecondary,
            }}
          >
            <MyText
              fontSize={moderateScale(22)}
              weight="800"
              color={
                discoverable
                  ? themeColors.dark.onAccent
                  : themeColors.dark.textMuted
              }
            >
              ♪
            </MyText>
          </View>

          {sessions.slice(0, 8).map((session, index) => (
            <HostDot
              key={session.id}
              session={session}
              index={index}
              total={Math.min(sessions.length, 8)}
              active={isActive}
            />
          ))}
        </View>
      </View>

      <XStack items="center" justify="center" gap={scale(8)}>
        <ScanningDot active={discoverable && isScanning} />
        <MyText
          fontSize={moderateScale(13)}
          weight="600"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          {statusText}
        </MyText>
      </XStack>

      {hasSessions && discoverable ? (
        <View
          style={{
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(5),
            borderRadius: moderateScale(12),
            backgroundColor: `${themeColors.dark.accent}18`,
            borderWidth: 1,
            borderColor: `${themeColors.dark.accent}35`,
          }}
        >
          <MyText
            fontSize={moderateScale(12)}
            weight="700"
            color={themeColors.dark.accent}
            textAlign="center"
          >
            {sessions.length} session{sessions.length === 1 ? "" : "s"} found
          </MyText>
        </View>
      ) : discoverable ? (
        <ScanEmptyState discoverable={discoverable} />
      ) : null}
    </YStack>
  );
}
