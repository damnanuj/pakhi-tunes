import { Image } from "react-native";
import { XStack, YStack } from "tamagui";
import { Verified } from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import type { ArtistDetail } from "src/types/artistSongs.types";

const IMAGE_SIZE = moderateScale(100);

function getImageUrl(
  images: { quality: string; url: string }[],
  preferred = "150x150"
): string {
  const found = images.find((i) => i.quality === preferred);
  return (
    found?.url ??
    images.find((i) => i.quality === "500x500")?.url ??
    images[0]?.url ??
    ""
  );
}

function formatListeners(count: number): string {
  return count.toLocaleString();
}

interface ArtistProfileHeaderProps {
  artist: ArtistDetail;
}

export default function ArtistProfileHeader({
  artist,
}: ArtistProfileHeaderProps) {
  const imageUrl = getImageUrl(artist.image);

  return (
    <YStack
      // mb={verticalScale(5)}
      // borderBottomWidth={1}
      borderColor={themeColors.dark.borderSecondary}
      items="center"
      pb={verticalScale(24)}
      // pt={verticalScale(16)}
      bg={themeColors.dark.background}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: IMAGE_SIZE / 2,
        }}
        resizeMode="cover"
      />
      <XStack
        items="center"
        justify="center"
        gap={scale(8)}
        mt={verticalScale(8)}
      >
        <MyText
          fontSize={moderateScale(16)}
          weight="700"
          color={themeColors.dark.onSurface}
        >
          {artist.name}
        </MyText>
        {artist.isVerified && (
          <Verified size={moderateScale(18)} color="#22c55e" />
        )}
      </XStack>
      <MyText
        fontSize={moderateScale(12)}
        weight="400"
        color={themeColors.dark.textMuted}
        mt={verticalScale(2)}
      >
        Artist · {formatListeners(artist.fanCount)} Listeners
      </MyText>
    </YStack>
  );
}
