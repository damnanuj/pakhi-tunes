import { useCallback } from "react";
import { FlatList, ListRenderItem, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import {
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
} from "src/hooks";
import { getArtistSongs } from "src/services";
import SongListItem from "../components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import ArtistProfileHeader from "../components/ArtistProfileHeader";
import ArtistSongsPageSkeleton, {
  SongListItemSkeleton,
} from "../skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ArtistSongsResponse } from "src/types/artistSongs.types";
const PAGE_SIZE = 20;

function getItems(res: ArtistSongsResponse) {
  return res.data.results;
}

function getNextPageParam(res: ArtistSongsResponse): number | undefined {
  const { next, currentPage } = res.data;
  if (!next) return undefined;
  return currentPage * PAGE_SIZE;
}

export default function ArtistSongsPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const artistName = name ?? "Artist";
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });

  const {
    items: songs,
    firstPage,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePaginatedQuery<ArtistSong, ArtistSongsResponse>({
    queryKey: ["artistSongs", id ?? "", PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getArtistSongs(id!, { limit: PAGE_SIZE, offset: pageParam }),
    getItems,
    getNextPageParam,
    pageSize: PAGE_SIZE,
    enabled: !!id,
  });

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      await refetch();
    },
  });

  const artist = firstPage?.data?.artist;

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback(
    (item: ArtistSong, index: number) =>
      `${item.encrypted_id ?? item.id}-${index}`,
    []
  );

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if (isError) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
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
              Failed to load songs
            </MyText>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  const listHeader = artist ? <ArtistProfileHeader artist={artist} /> : null;

  const listFooter = isFetchingNextPage ? (
    <YStack py={verticalScale(8)}>
      {Array.from({ length: 5 }, (_, i) => (
        <SongListItemSkeleton key={i} />
      ))}
    </YStack>
  ) : null;

  const queueSource = {
    type: "artist" as const,
    id: id ?? "",
    name: artistName,
  };

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={`${artistName} songs`} />
      <QueueProvider songs={songs} source={queueSource}>
        <FlatList
          data={songs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          refreshControl={refreshControl}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
        />
      </QueueProvider>
    </YStack>
  );
}
