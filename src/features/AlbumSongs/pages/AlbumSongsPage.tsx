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
import { getAlbumSongs } from "src/services";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import AlbumProfileHeader from "../components/AlbumProfileHeader";
import ArtistSongsPageSkeleton, {
  SongListItemSkeleton,
} from "src/features/ArtistSongs/skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { AlbumSongsResponse } from "src/types/albumSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";

const PAGE_SIZE = 20;

function getItems(res: AlbumSongsResponse) {
  return res.data.results;
}

function getNextPageParam(res: AlbumSongsResponse): number | undefined {
  const { next, currentPage } = res.data;
  if (!next) return undefined;
  return currentPage * PAGE_SIZE;
}

export default function AlbumSongsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: 0,
  });

  const {
    items: songs,
    firstPage,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePaginatedQuery<ArtistSong, AlbumSongsResponse>({
    queryKey: ["albumSongs", id ?? "", PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getAlbumSongs(id!, { limit: PAGE_SIZE, offset: pageParam }),
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

  const album = firstPage?.data?.album;
  const headerTitle = album
    ? decodeHtmlEntities(album.name)
    : "Album";

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
        <ScreenHeader showBack title={headerTitle} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if (isError || !album) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
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
              Failed to load album
            </MyText>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  const listHeader = <AlbumProfileHeader album={album} />;

  const listFooter = isFetchingNextPage ? (
    <YStack py={verticalScale(8)}>
      {Array.from({ length: 5 }, (_, i) => (
        <SongListItemSkeleton key={i} />
      ))}
    </YStack>
  ) : null;

  const queueSource = {
    type: "album" as const,
    id: id ?? "",
    name: headerTitle,
  };

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={headerTitle} />
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
