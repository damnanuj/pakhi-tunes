import { useMemo } from "react";
import { FlatList, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import { useMiniPlayerBottomInset } from "src/features/Player";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import { useRefreshable } from "src/hooks";
import { getTopArtists } from "src/services";
import ArtistGridItem from "../components/ArtistGridItem";
import TopArtistsPageSkeleton from "../skeletons/TopArtistsPageSkeleton";
import type { TopArtist } from "src/types/topArtists.types";

const TOP_ARTISTS_LIMIT = 50;
const HORIZONTAL_PADDING = scale(20);
const GAP = scale(16);

export default function TopArtistsPage() {
  const router = useRouter();
  const miniPlayerInset = useMiniPlayerBottomInset();
  const listBottomPadding = useMemo(
    () => TAB_BAR_HEIGHT + miniPlayerInset,
    [miniPlayerInset]
  );
  const { refreshControl } = useRefreshable({
    queryKeys: ["topArtists", TOP_ARTISTS_LIMIT],
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["topArtists", TOP_ARTISTS_LIMIT],
    queryFn: () => getTopArtists({ limit: TOP_ARTISTS_LIMIT }),
  });

  const artists = data?.data?.results ?? [];

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader title="Top Artists" showBack />
        <TopArtistsPageSkeleton />
      </YStack>
    );
  }

  if (isError) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader title="Top Artists" showBack />
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <YStack px={scale(20)} py={verticalScale(24)} style={{ alignSelf: "center" }}>
            <MyText
              fontSize={moderateScale(14)}
              color={themeColors.dark.textMuted}
              textAlign="center"
            >
              Failed to load top artists
            </MyText>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  const handleArtistPress = (artist: TopArtist) => {
    router.push({
      pathname: "/home/top-artists/[id]",
      params: { id: artist.encrypted_id, name: artist.name },
    });
  };

  const renderItem = ({ item }: { item: TopArtist }) => (
    <ArtistGridItem artist={item} onPress={handleArtistPress} />
  );

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Top Artists" showBack />
      <FlatList
        data={artists}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={refreshControl}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: verticalScale(24) + listBottomPadding,
        }}
        columnWrapperStyle={{ gap: GAP, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
