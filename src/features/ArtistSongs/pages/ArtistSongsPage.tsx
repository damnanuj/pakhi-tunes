import { useCallback, useMemo } from "react";
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
import SongListItem from "../components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import ArtistProfileHeader from "../components/ArtistProfileHeader";
import ArtistSongsPageSkeleton, {
  SongListItemSkeleton,
} from "../skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import {
  ARTIST_SONGS_PAGE_SIZE,
  getArtistSongsQueryOptions,
} from "../queries/artistSongsQuery";
import { getSongListItemLayout } from "../utils/songListItemLayout";
import { getSongListKey } from "../utils/songListKeys";

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
  } = useInfinitePaginatedQuery({
    ...getArtistSongsQueryOptions(id ?? ""),
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
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const queueSource = useMemo(
    () => ({
      type: "artist" as const,
      id: id ?? "",
      name: artistName,
    }),
    [id, artistName]
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
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          getItemLayout={getSongListItemLayout}
          removeClippedSubviews
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
        />
      </QueueProvider>
    </YStack>
  );
}
