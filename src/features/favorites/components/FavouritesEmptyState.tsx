import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { Heart } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

type FavouritesEmptyStateProps = {
  bottomPadding?: number;
  onExplorePress?: () => void;
};

export default function FavouritesEmptyState({
  bottomPadding = 0,
  onExplorePress,
}: FavouritesEmptyStateProps) {
  const router = useRouter();

  const handleExplore = () => {
    if (onExplorePress) {
      onExplorePress();
      return;
    }
    router.push("/(tabs)/home");
  };

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
        <Heart size={moderateScale(36)} color={themeColors.dark.textMuted} />
      </View>

      <YStack gap={verticalScale(8)} items="center">
        <MyText
          fontSize={moderateScale(18)}
          weight="700"
          color={themeColors.dark.onSurface}
          textAlign="center"
        >
          No favourites yet
        </MyText>
        <MyText
          fontSize={moderateScale(14)}
          weight="400"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          Tap the heart on any song to save it here for quick access.
        </MyText>
      </YStack>

      <TouchableOpacity
        onPress={handleExplore}
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
