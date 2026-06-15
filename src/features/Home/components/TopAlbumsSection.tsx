import { ScrollView, Image } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

const TOP_ALBUMS = [
  {
    name: "Midnights",
    artist: "Taylor Swift",
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
  },
  {
    name: "Dawn FM",
    artist: "The Weeknd",
    cover:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop",
  },
  {
    name: "Future Nostalgia",
    artist: "Dua Lipa",
    cover:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop",
  },
  {
    name: "30",
    artist: "Adele",
    cover:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop",
  },
  {
    name: "Happier Than Ever",
    artist: "Billie Eilish",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
  },
];

const ALBUM_SIZE = moderateScale(72);

export default function TopAlbumsSection() {
  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <XStack
        justify="space-between"
        items="center"
        mb={verticalScale(16)}
      >
        <MyText
          fontSize={moderateScale(18)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
        >
          Top Albums
        </MyText>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.accent}>
          See All
        </MyText>
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {TOP_ALBUMS.map((album, index) => (
          <YStack
            key={index}
            items="center"
            style={{ maxWidth: ALBUM_SIZE + scale(8) }}
          >
            <Image
              source={{ uri: album.cover }}
              style={{
                width: ALBUM_SIZE,
                height: ALBUM_SIZE,
                borderRadius: moderateScale(8),
              }}
              resizeMode="cover"
            />
            <MyText
              fontSize={moderateScale(12)}
              fontWeight="500"
              color={themeColors.dark.onSurface}
              numberOfLines={1}
              mt={verticalScale(8)}
              textAlign="center"
            >
              {album.name}
            </MyText>
            <MyText
              fontSize={moderateScale(10)}
              color={themeColors.dark.textMuted}
              numberOfLines={1}
              textAlign="center"
            >
              {album.artist}
            </MyText>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
