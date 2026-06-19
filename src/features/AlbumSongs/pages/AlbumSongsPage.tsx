import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ScreenHeader from "src/components/ScreenHeader";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import {
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import AlbumProfileHeader from "../components/AlbumProfileHeader";
import ArtistSongsPageSkeleton from "src/features/ArtistSongs/skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getAlbumSongsQueryOptions } from "../queries/albumSongsQuery";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";

export default function AlbumSongsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: 0,
  });

  const {
    items: songs,
    firstPage,
    isLoading,
    isError,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useInfinitePaginatedQuery({
    ...getAlbumSongsQueryOptions(id ?? ""),
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

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const queueSource = useMemo(
    () => ({
      type: "album" as const,
      id: id ?? "",
      name: headerTitle,
    }),
    [id, headerTitle]
  );

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if ((isError || !album) && songs.length === 0) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          subtitle="We couldn't load this album. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </YStack>
    );
  }

  const listHeader = <AlbumProfileHeader album={album!} />;

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

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
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
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
