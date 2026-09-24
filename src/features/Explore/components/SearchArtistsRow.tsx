import { ScrollView, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { SearchArtistItem } from "src/types/songSearch.types";

const ARTIST_SIZE = moderateScale(72);

interface SearchArtistsRowProps {
  artists: SearchArtistItem[];
}

export default function SearchArtistsRow({ artists }: SearchArtistsRowProps) {
  const router = useRouter();

  if (artists.length === 0) {
    return null;
  }

  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <MyText
        fontSize={moderateScale(18)}
        fontWeight="600"
        color={themeColors.dark.onSurface}
        mb={verticalScale(16)}
      >
        Artists
      </MyText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {artists.map((artist) => {
          const name = decodeHtmlEntities(artist.name);

          return (
            <Pressable
              key={artist.id}
              onPress={() =>
                router.push({
                  pathname: "/home/top-artists/[id]",
                  params: { id: artist.encrypted_id, name: artist.name },
                })
              }
            >
              <YStack
                items="center"
                style={{ maxWidth: ARTIST_SIZE + scale(8) }}
              >
                <Image
                  source={{ uri: artist.image }}
                  style={{
                    width: ARTIST_SIZE,
                    height: ARTIST_SIZE,
                    borderRadius: ARTIST_SIZE / 2,
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
                  {name}
                </MyText>
              </YStack>
            </Pressable>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
