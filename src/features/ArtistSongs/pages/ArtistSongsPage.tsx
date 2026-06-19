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
import SongListItem from "../components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import ArtistProfileHeader from "../components/ArtistProfileHeader";
import ArtistSongsPageSkeleton from "../skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getArtistSongsQueryOptions } from "../queries/artistSongsQuery";
import { getSongListKey } from "../utils/songListKeys";

export default function ArtistSongsPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { isOffline } = useNetwork();
  const artistName = name ?? "Artist";
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });

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

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if (isError && songs.length === 0) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </YStack>
    );
  }

  const listHeader = artist ? <ArtistProfileHeader artist={artist} /> : null;

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

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
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
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
