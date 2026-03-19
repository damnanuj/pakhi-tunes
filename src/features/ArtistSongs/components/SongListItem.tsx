import { Image, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import { CirclePlay, MoreVertical } from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import type { ArtistSong } from "src/types/artistSongs.types";

const IMAGE_SIZE = moderateScale(56);

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

interface SongListItemProps {
  song: ArtistSong;
}

export default function SongListItem({ song }: SongListItemProps) {
  const artistNames = song.artists.primary.map((a) => a.name).join(", ");
  const imageUrl = getImageUrl(song.image);

  return (
    <XStack
      items="center"
      gap={scale(12)}
      py={verticalScale(12)}
      px={scale(20)}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: moderateScale(8),
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
          {song.name}
        </MyText>
        <MyText
          fontSize={moderateScale(13)}
          weight="500"
          color={themeColors.dark.textMuted}
          numberOfLines={1}
        >
          {artistNames}
        </MyText>
      </YStack>
      <Pressable hitSlop={8}>
        <MoreVertical
          size={moderateScale(20)}
          color={themeColors.dark.onSurface}
        />
      </Pressable>
      <Pressable hitSlop={8}>
        <CirclePlay size={moderateScale(30)} color={themeColors.dark.accent} />
      </Pressable>
    </XStack>
  );
}
