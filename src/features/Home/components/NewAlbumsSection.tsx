import { ScrollView, Image, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { NEW_RELEASES_DISPLAY_LIMIT_HOME_ALBUMS } from "src/utils/constants/newReleases";
import { getNewReleasesHomeAlbumsQueryOptions } from "../queries/newReleasesQuery";
import NewAlbumsSectionSkeleton from "../skeletons/NewAlbumsSectionSkeleton";

const ALBUM_SIZE = moderateScale(72);

export default function NewAlbumsSection() {
  const router = useRouter();
  const { isOffline } = useNetwork();
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery(
    getNewReleasesHomeAlbumsQueryOptions()
  );

  const albums = (data?.data?.results ?? []).slice(
    0,
    NEW_RELEASES_DISPLAY_LIMIT_HOME_ALBUMS
  );

  if (isLoading) {
    return <NewAlbumsSectionSkeleton />;
  }

  if (isError) {
    return (
      <ConnectionErrorState
        compact
        variant={
          isNetworkRelatedError(error, isOffline) ? "offline" : "error"
        }
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (albums.length === 0) {
    return null;
  }

  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <MyText
          fontSize={moderateScale(18)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
        >
          New Albums
        </MyText>
        <Pressable onPress={() => router.push("/home/new-albums" as never)}>
          <MyText fontSize={moderateScale(14)} color={themeColors.dark.accent}>
            See All
          </MyText>
        </Pressable>
      </XStack>
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
                <MyText
                  fontSize={moderateScale(10)}
                  color={themeColors.dark.textMuted}
                  numberOfLines={1}
                  textAlign="center"
                >
                  Album
                </MyText>
              </YStack>
            </Pressable>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
