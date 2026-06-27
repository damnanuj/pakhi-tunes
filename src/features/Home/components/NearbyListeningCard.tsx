import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Radio } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";

const RING_SIZES = [moderateScale(52), moderateScale(40), moderateScale(28)];
const PULSE_DELAYS = [0, 800, 1600];

function PulseRing({
  size,
  delay,
  accent,
}: {
  size: number;
  accent: string;
  delay: number;
}) {
  const scaleValue = useSharedValue(0.85);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scaleValue.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 0 }),
          withTiming(1.35, { duration: 2000, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 0 }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.cubic) })
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
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: accent,
        },
        style,
      ]}
    />
  );
}

export default function NearbyListeningCard() {
  const router = useRouter();
  const accent = themeColors.dark.accent;
  const surface = themeColors.dark.surfaceSecondary;

  return (
    <Pressable
      onPress={() => router.push("/home/nearby")}
      style={{ paddingHorizontal: scale(20) }}
    >
      <View
        style={{
          borderRadius: moderateScale(16),
          overflow: "hidden",
          borderWidth: 1,
          borderColor: themeColors.dark.borderSecondary,
        }}
      >
        <LinearGradient
          colors={[`${accent}14`, surface, surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "100%" }}
        >
          <XStack items="center" gap={scale(12)} py={verticalScale(12)} px={scale(14)}>
            <View
              style={{
                width: moderateScale(52),
                height: moderateScale(52),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {RING_SIZES.map((size, index) => (
                <PulseRing
                  key={size}
                  size={size}
                  accent={`${accent}55`}
                  delay={PULSE_DELAYS[index] ?? 0}
                />
              ))}
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(18),
                  backgroundColor: themeColors.dark.surface,
                  borderWidth: 1.5,
                  borderColor: accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Radio size={moderateScale(16)} color={accent} />
              </View>
            </View>

            <YStack flex={1} gap={verticalScale(2)} style={{ minWidth: 0 }}>
              <MyText
                fontSize={moderateScale(15)}
                weight="700"
                color={themeColors.dark.onSurface}
                numberOfLines={1}
              >
                Nearby sessions
              </MyText>
              <MyText
                fontSize={moderateScale(12)}
                weight="500"
                color={themeColors.dark.textMuted}
                numberOfLines={1}
              >
                Tap to scan live listeners
              </MyText>
            </YStack>

            <View
              style={{
                paddingHorizontal: scale(10),
                paddingVertical: verticalScale(5),
                borderRadius: moderateScale(12),
                backgroundColor: `${accent}18`,
                borderWidth: 1,
                borderColor: `${accent}40`,
              }}
            >
              <MyText fontSize={moderateScale(11)} weight="700" color={accent}>
                Scan
              </MyText>
            </View>
          </XStack>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
