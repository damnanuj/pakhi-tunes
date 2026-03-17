import { ScrollView, Image } from "react-native";
import { XStack, YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import MyText from "src/components/customTabBars/styleComponents/MyText";
import themeColors from "src/utils/theme/colors";

const TOP_ARTISTS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop",
];

const ARTIST_SIZE = moderateScale(72);

export default function TopArtistsSection() {
  return (
    <YStack px={scale(20)}>
      <XStack justifyContent="space-between" alignItems="center" mb={verticalScale(16)}>
        <MyText fontSize={moderateScale(18)} fontWeight="600" color={themeColors.dark.WHITE}>
          Top Artists
        </MyText>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.YELLOW}>
          See All
        </MyText>
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {TOP_ARTISTS.map((uri, index) => (
          <XStack key={index} alignItems="center">
            <Image
              source={{ uri }}
              style={{
                width: ARTIST_SIZE,
                height: ARTIST_SIZE,
                borderRadius: ARTIST_SIZE / 2,
              }}
              resizeMode="cover"
            />
          </XStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
