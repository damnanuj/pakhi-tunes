import { Image } from "react-native";
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
import type { AlbumDetail } from "src/types/albumSongs.types";

const COVER_SIZE = moderateScale(120);

interface AlbumProfileHeaderProps {
  album: AlbumDetail;
}

export default function AlbumProfileHeader({ album }: AlbumProfileHeaderProps) {
  const imageUrl = getSongCoverUrl(album.image);
  const title = decodeHtmlEntities(album.name);
  const subtitle = decodeHtmlEntities(album.subtitle).trim();
  const description = decodeHtmlEntities(album.description).trim();

  return (
    <YStack
      borderColor={themeColors.dark.borderSecondary}
      items="center"
      pb={verticalScale(24)}
      px={scale(20)}
      bg={themeColors.dark.background}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          borderRadius: moderateScale(12),
        }}
        resizeMode="cover"
      />
      <MyText
        fontSize={moderateScale(18)}
        weight="700"
        color={themeColors.dark.onSurface}
        textAlign="center"
        mt={verticalScale(12)}
      >
        {title}
      </MyText>
      {subtitle ? (
        <MyText
          fontSize={moderateScale(14)}
          weight="600"
          color={themeColors.dark.textMuted}
          textAlign="center"
          mt={verticalScale(4)}
        >
          {subtitle}
        </MyText>
      ) : null}
      {description ? (
        <MyText
          fontSize={moderateScale(13)}
          color={themeColors.dark.textMuted}
          textAlign="center"
          mt={verticalScale(8)}
          lineHeight={moderateScale(18)}
        >
          {description}
        </MyText>
      ) : null}
      <MyText
        fontSize={moderateScale(13)}
        color={themeColors.dark.accent}
        mt={verticalScale(10)}
      >
        {album.songCount} {album.songCount === 1 ? "song" : "songs"}
      </MyText>
    </YStack>
  );
}
