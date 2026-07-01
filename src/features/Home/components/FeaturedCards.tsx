import { ScrollView, Image, View, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  scale,
  moderateScale,
} from "src/utils/functions/dimensions";
import { SCREEN_WIDTH } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { getGenres } from "src/services";
import { getGenreCardImageUrl } from "src/utils/constants/genreCardImages";
import FeaturedCardsSkeleton from "../skeletons/FeaturedCardsSkeleton";

const CARD_WIDTH = (SCREEN_WIDTH - scale(20) * 3) / 2;
const CARD_HEIGHT = moderateScale(180);

export default function FeaturedCards() {
  const router = useRouter();
  const { data, isPending, isLoading, isError } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const genres = data?.data ?? [];

  if ((isPending || isLoading) && !data) {
    return <FeaturedCardsSkeleton />;
  }

  if (isError && !data) {
    return null;
  }

  if (genres.length === 0) {
    return null;
  }

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
      {genres.map((genre) => (
        <Pressable
          key={genre.slug}
          onPress={() =>
            router.push({
              pathname: "/home/genres/[slug]",
              params: { slug: genre.slug, name: genre.name },
            })
          }
        >
          <View
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: moderateScale(16),
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: getGenreCardImageUrl(genre.slug) }}
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
                color={themeColors.dark.onSurface}
                numberOfLines={2}
              >
                {genre.name}
              </MyText>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
