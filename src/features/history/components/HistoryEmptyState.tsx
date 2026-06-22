import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { History } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

type HistoryEmptyStateProps = {
  variant?: "recent" | "full";
  bottomPadding?: number;
};

export default function HistoryEmptyState({
  variant = "recent",
  bottomPadding = 0,
}: HistoryEmptyStateProps) {
  const router = useRouter();

  const title =
    variant === "recent" ? "Nothing played yet" : "No listening history";
  const description =
    variant === "recent"
      ? "Songs you play will show up here. Start with something from Home or Search."
      : "Your full listening history will appear here once you start playing music.";

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      px={scale(32)}
      gap={verticalScale(16)}
      pb={bottomPadding}
    >
      <View
        style={{
          width: moderateScale(80),
          height: moderateScale(80),
          borderRadius: moderateScale(40),
          backgroundColor: themeColors.dark.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <History
          size={moderateScale(36)}
          color={themeColors.dark.textMuted}
        />
      </View>

      <YStack gap={verticalScale(8)} items="center">
        <MyText
          fontSize={moderateScale(18)}
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
          {description}
        </MyText>
      </YStack>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/home")}
        activeOpacity={0.85}
        style={{
          marginTop: verticalScale(8),
          paddingVertical: verticalScale(12),
          paddingHorizontal: scale(24),
          borderRadius: moderateScale(24),
          backgroundColor: themeColors.dark.accent,
        }}
      >
        <MyText
          fontSize={moderateScale(15)}
          weight="700"
          color={themeColors.dark.onAccent}
        >
          Explore music
        </MyText>
      </TouchableOpacity>
    </YStack>
  );
}
