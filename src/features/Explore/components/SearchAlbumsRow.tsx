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
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { NewReleaseAlbumItem } from "src/types/newReleases.types";

const ALBUM_SIZE = moderateScale(72);

interface SearchAlbumsRowProps {
  albums: NewReleaseAlbumItem[];
}

export default function SearchAlbumsRow({ albums }: SearchAlbumsRowProps) {
  const router = useRouter();

  if (albums.length === 0) {
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
        Albums
      </MyText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {albums.map((album) => {
          const title = decodeHtmlEntities(album.name);
          const cover = getSongCoverUrl(album.image, "150x150");

          return (
            <Pressable
              key={album.id}
              onPress={() =>
                router.push({
                  pathname: "/home/album/[id]",
                  params: { id: album.id },
                })
              }
            >
              <YStack
                items="center"
                style={{ maxWidth: ALBUM_SIZE + scale(8) }}
              >
                <Image
                  source={{ uri: cover }}
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
                  {title}
                </MyText>
              </YStack>
            </Pressable>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
