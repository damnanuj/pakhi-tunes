import { View } from "react-native";
import { YStack } from "tamagui";
import { ListMusic } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { useScrollBottomInset } from "src/hooks";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

export default function LibraryPlaylistsPlaceholder() {
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(16),
  });

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      px={scale(32)}
      gap={verticalScale(16)}
      pb={scrollBottomPadding}
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
          Playlists are on the way
        </MyText>
        <MyText
          fontSize={moderateScale(14)}
          weight="400"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          We&apos;re cooking something good — save this spot, we&apos;ll be back
          with playlists soon.
        </MyText>
        <MyText
          fontSize={moderateScale(13)}
          weight="400"
          color={themeColors.dark.textMuted}
          textAlign="center"
          style={{ marginTop: verticalScale(4) }}
        >
          For now, favourite songs and build your vibe from Recent & Downloads.
        </MyText>
      </YStack>
    </YStack>
  );
}
