import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { YStack } from "tamagui";
import { WifiOff } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

function OfflineIllustration() {
  const size = moderateScale(120);
  const accent = themeColors.dark.accent;
  const muted = themeColors.dark.textMuted;

  return (
    <View style={{ width: size, height: size, alignItems: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r="52"
          fill={themeColors.dark.surfaceSecondary}
        />
        <Path
          d="M38 72c8-10 18-15 22-15s14 5 22 15"
          stroke={accent}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M48 82c4-5 8-7 12-7s8 2 12 7"
          stroke={accent}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx="60" cy="92" r="5" fill={accent} />
        <Line
          x1="34"
          y1="34"
          x2="86"
          y2="86"
          stroke={muted}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: "absolute", top: moderateScale(8), right: 0 }}>
        <WifiOff size={moderateScale(28)} color="#f87171" />
      </View>
    </View>
  );
}

interface OfflineFallbackProps {
  title?: string;
  subtitle?: string;
  showDownloadsCta?: boolean;
}

export default function OfflineFallback({
  title = "You're offline",
  subtitle = "Downloaded songs are available in your Library",
  showDownloadsCta = true,
}: OfflineFallbackProps) {
  const router = useRouter();

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      px={scale(32)}
      gap={verticalScale(16)}
    >
      <OfflineIllustration />
      <MyText
        fontSize={moderateScale(20)}
        weight="700"
        color={themeColors.dark.onSurface}
        textAlign="center"
      >
        {title}
      </MyText>
      <MyText
        fontSize={moderateScale(14)}
        weight="400"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        {subtitle}
      </MyText>
      {showDownloadsCta ? (
        <Pressable
          onPress={() =>
            router.push("/(tabs)/library?tab=downloads" as never)
          }
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: verticalScale(8),
            paddingHorizontal: scale(24),
            paddingVertical: verticalScale(12),
            borderRadius: moderateScale(24),
            backgroundColor: themeColors.dark.accent,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MyText
            fontSize={moderateScale(14)}
            weight="700"
            color={themeColors.dark.onAccent}
          >
            Go to Downloads
          </MyText>
        </Pressable>
      ) : null}
    </YStack>
  );
}
