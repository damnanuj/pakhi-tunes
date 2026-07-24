import { memo } from "react";
import { Image, View } from "react-native";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

interface PlaylistDetailHeaderProps {
  name: string;
  coverUrl: string;
  songCount: number;
}

const COVER_SIZE = moderateScale(110);

function PlaylistDetailHeader({
  name,
  coverUrl,
  songCount,
}: PlaylistDetailHeaderProps) {
  return (
    <YStack
      items="center"
      px={scale(20)}
      pt={verticalScale(8)}
      pb={verticalScale(20)}
      gap={verticalScale(14)}
    >
      <View
        style={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          borderRadius: moderateScale(14),
          overflow: "hidden",
          backgroundColor: themeColors.dark.surfaceSecondary,
        }}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : null}
      </View>
      <YStack items="center" gap={verticalScale(4)}>
        <MyText
          fontSize={moderateScale(22)}
          weight="700"
          color={themeColors.dark.onSurface}
          textAlign="center"
          numberOfLines={2}
        >
          {name}
        </MyText>
        <MyText
          fontSize={moderateScale(13)}
          weight="500"
          color={themeColors.dark.textMuted}
        >
          {songCount === 1 ? "1 song" : `${songCount} songs`}
        </MyText>
      </YStack>
    </YStack>
  );
}

export default memo(PlaylistDetailHeader);
