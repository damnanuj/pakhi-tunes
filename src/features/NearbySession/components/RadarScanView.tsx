import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";
import type { NearbySession } from "../types/session.types";

const RADAR_SIZE = moderateScale(260);
const PULSE_COUNT = 3;

function PulseRing({ delay }: { delay: number }) {
  const scaleValue = useSharedValue(0.3);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
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
  }, [delay, opacity, scaleValue]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacity.value,
  }));

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
}: {
  session: NearbySession;
  index: number;
  total: number;
}) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radius = RADAR_SIZE * 0.34;
  const left = RADAR_SIZE / 2 + Math.cos(angle) * radius - moderateScale(8);
  const top = RADAR_SIZE / 2 + Math.sin(angle) * radius - moderateScale(8);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, [pulse]);

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

type RadarScanViewProps = {
  sessions: NearbySession[];
  isScanning: boolean;
};

export default function RadarScanView({ sessions, isScanning }: RadarScanViewProps) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotate]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const statusText = isScanning
    ? "Scanning nearby..."
    : sessions.length === 0
      ? "No sessions nearby yet"
      : `${sessions.length} session${sessions.length === 1 ? "" : "s"} found`;

  return (
    <YStack items="center" gap={verticalScale(16)}>
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
          }}
        >
          {Array.from({ length: PULSE_COUNT }).map((_, i) => (
            <PulseRing key={i} delay={i * 800} />
          ))}

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

          <View
            style={{
              width: moderateScale(56),
              height: moderateScale(56),
              borderRadius: moderateScale(28),
              backgroundColor: themeColors.dark.accent,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <MyText fontSize={moderateScale(22)} weight="800" color={themeColors.dark.onAccent}>
              ♪
            </MyText>
          </View>

          {sessions.slice(0, 8).map((session, index) => (
            <HostDot
              key={session.id}
              session={session}
              index={index}
              total={Math.min(sessions.length, 8)}
            />
          ))}
        </View>
      </View>

      <MyText
        fontSize={moderateScale(15)}
        weight="600"
        color={themeColors.dark.textMuted}
        textAlign="center"
        px={scale(24)}
      >
        {statusText}
      </MyText>
    </YStack>
  );
}
