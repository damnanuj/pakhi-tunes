import { Image, Pressable } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import type { TopArtist } from "src/types/topArtists.types";

const HORIZONTAL_PADDING = scale(20);
const GAP = scale(16);
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP) / 2;
const IMAGE_SIZE = ITEM_WIDTH;

interface ArtistGridItemProps {
  artist: TopArtist;
  onPress?: (artist: TopArtist) => void;
}

export default function ArtistGridItem({ artist, onPress }: ArtistGridItemProps) {
  const content = (
    <YStack
      width={ITEM_WIDTH}
      items="center"
      mb={verticalScale(20)}
    >
      <Image
        source={{ uri: artist.image }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: IMAGE_SIZE / 2,
        }}
        resizeMode="cover"
      />
      <MyText
        fontSize={moderateScale(14)}
        weight="700"
        color={themeColors.dark.onSurface}
        numberOfLines={1}
        mt={verticalScale(12)}
        textAlign="center"
      >
        {artist.name}
      </MyText>
      <MyText
        fontSize={moderateScale(12)}
        weight="400"
        color={themeColors.dark.textMuted}
        numberOfLines={1}
        mt={verticalScale(4)}
        textAlign="center"
      >
        {artist.fansText}
      </MyText>
    </YStack>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(artist)}>
        {content}
      </Pressable>
    );
  }

  return content;
}
