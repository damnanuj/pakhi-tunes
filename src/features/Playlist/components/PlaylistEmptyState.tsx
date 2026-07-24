import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { ListMusic } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

type PlaylistsEmptyStateProps = {
  bottomPadding?: number;
  isAuthenticated?: boolean;
  onExplorePress?: () => void;
};

export default function PlaylistsEmptyState({
  bottomPadding = 0,
  isAuthenticated = true,
  onExplorePress,
}: PlaylistsEmptyStateProps) {
  const router = useRouter();

  const handlePrimary = () => {
    if (onExplorePress) {
      onExplorePress();
      return;
    }
    if (!isAuthenticated) {
      router.push({
        pathname: "/auth",
        params: {
          mode: "signin",
          redirect: "/(tabs)/library?tab=playlists",
        },
      });
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
        <ListMusic
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
          {isAuthenticated ? "No playlists yet" : "Sign in for playlists"}
        </MyText>
        <MyText
          fontSize={moderateScale(14)}
          weight="400"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          {isAuthenticated
            ? "Save songs to a playlist from the song menu to get started."
            : "Sign in to create playlists and keep your music organised."}
        </MyText>
      </YStack>

      <TouchableOpacity
        onPress={handlePrimary}
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
          {isAuthenticated ? "Explore music" : "Sign in"}
        </MyText>
      </TouchableOpacity>
    </YStack>
  );
}
