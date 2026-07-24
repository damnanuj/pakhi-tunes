import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Users } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  LISTEN_TOGETHER_HOME_REDIRECT,
  redirectToSignInForNearby,
} from "src/features/NearbySession/utils/nearbyAuthGate";
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
  const scaleValue = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1.35,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const timer = setTimeout(() => {
      pulse.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [delay, opacity, scaleValue]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: accent,
        opacity,
        transform: [{ scale: scaleValue }],
      }}
    />
  );
}

export default function ListenTogetherCard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const accent = themeColors.dark.accent;
  const surface = themeColors.dark.surfaceSecondary;

  const handlePress = () => {
    if (!isAuthenticated) {
      redirectToSignInForNearby(router, LISTEN_TOGETHER_HOME_REDIRECT);
      return;
    }
    router.push("/home/listen-together");
  };

  return (
    <Pressable
      onPress={handlePress}
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
                <Users size={moderateScale(16)} color={accent} />
              </View>
            </View>

            <YStack flex={1} gap={verticalScale(2)} style={{ minWidth: 0 }}>
              <MyText
                fontSize={moderateScale(15)}
                weight="700"
                color={themeColors.dark.onSurface}
                numberOfLines={1}
              >
                Listen Together
              </MyText>
              <MyText
                fontSize={moderateScale(12)}
                weight="500"
                color={themeColors.dark.textMuted}
                numberOfLines={1}
              >
                Create or join a room with a code
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
                Room
              </MyText>
            </View>
          </XStack>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
