import { memo } from "react";
import { Image, Pressable } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { ArtistSongImage } from "src/types/artistSongs.types";

const IMAGE_SIZE = moderateScale(56);

interface SearchEntityRowProps {
  name: string;
  subtitle?: string;
  image: ArtistSongImage[];
  roundImage?: boolean;
  onPress: () => void;
}

function SearchEntityRow({
  name,
  subtitle,
  image,
  roundImage = false,
  onPress,
}: SearchEntityRowProps) {
  const title = decodeHtmlEntities(name);
  const detail = subtitle ? decodeHtmlEntities(subtitle) : "";
  const cover = getSongCoverUrl(image, "150x150");
  const radius = roundImage ? IMAGE_SIZE / 2 : moderateScale(8);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(20),
        backgroundColor: pressed ? "rgba(255, 255, 255, 0.07)" : "transparent",
      })}
    >
      <Image
        source={cover ? { uri: cover } : undefined}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: radius,
          backgroundColor: themeColors.dark.surfaceSecondary,
        }}
        resizeMode="cover"
      />
      <YStack flex={1} style={{ minWidth: 0 }} justify="center">
        <MyText
          fontSize={moderateScale(14)}
          weight="600"
          color={themeColors.dark.onSurface}
          numberOfLines={1}
        >
          {title}
        </MyText>
        {detail ? (
          <MyText
            fontSize={moderateScale(13)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
            mt={verticalScale(2)}
          >
            {detail}
          </MyText>
        ) : null}
      </YStack>
    </Pressable>
  );
}

export default memo(SearchEntityRow);
