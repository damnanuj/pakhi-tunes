import { ScrollView, Image, View } from "react-native";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { SCREEN_WIDTH } from "src/utils/functions/dimensions";
import MyText from "src/components/customTabBars/styleComponents/MyText";
import themeColors from "src/utils/theme/colors";

const CARD_WIDTH = (SCREEN_WIDTH - scale(20) * 3) / 2;
const CARD_HEIGHT = moderateScale(180);

const GENRES = [
  {
    name: "Rock",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
  },
  {
    name: "Pop",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  },
  {
    name: "Hip Hop",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
  },
  {
    name: "Jazz",
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
  {
    name: "Classical",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop",
  },
  {
    name: "Electronic",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d9b?w=400&h=400&fit=crop",
  },
  {
    name: "R&B",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    name: "Country",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
  },
  {
    name: "Reggae",
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
  },
  {
    name: "Metal",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
  },
];

export default function FeaturedCards() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: scale(20),
        gap: scale(12),
        flexDirection: "row",
      }}
    >
      {GENRES.map((genre, index) => (
        <View
          key={index}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: moderateScale(16),
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: genre.image }}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(16),
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <MyText
              fontSize={moderateScale(20)}
              fontWeight="700"
              color={themeColors.dark.WHITE}
            >
              {genre.name}
            </MyText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
