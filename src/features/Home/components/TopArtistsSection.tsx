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
import ConnectionErrorState from "src/components/ConnectionErrorState";
import themeColors from "src/utils/theme/colors";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { getTopArtists } from "src/services";
import TopArtistsSectionSkeleton from "src/features/Home/skeletons/TopArtistsSectionSkeleton";

const ARTIST_SIZE = moderateScale(72);
const TOP_ARTISTS_LIMIT = 10;

export default function TopArtistsSection() {
  const router = useRouter();
  const { isOffline } = useNetwork();
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["topArtists", TOP_ARTISTS_LIMIT],
    queryFn: () => getTopArtists({ limit: TOP_ARTISTS_LIMIT }),
  });

  const artists = data?.data?.results ?? [];

  if (isLoading) {
    return <TopArtistsSectionSkeleton />;
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

  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <MyText
          fontSize={moderateScale(18)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
        >
          Top Artists
        </MyText>
        <Pressable onPress={() => router.push("/home/top-artists" as never)}>
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
        {artists.map((artist) => (
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
              {artist.name}
            </MyText>
          </YStack>
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  );
}
