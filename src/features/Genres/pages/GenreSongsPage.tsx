import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ScreenHeader from "src/components/ScreenHeader";
import { useNetwork } from "src/contexts/NetworkContext";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import {
  useConnectionErrorProps,
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getGenreSongsQueryOptions } from "../queries/genreSongsQuery";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import GenreSongsPageSkeleton from "../skeletons/GenreSongsPageSkeleton";

export default function GenreSongsPage() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const { isOffline } = useNetwork();
  const genreName = name ?? "Genre";
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });

  const {
    items: songs,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useInfinitePaginatedQuery({
    ...getGenreSongsQueryOptions(slug ?? ""),
    enabled: !!slug,
  });

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      await refetch();
    },
  });
  const connectionErrorProps = useConnectionErrorProps({
    isOffline,
    refetch,
    isFetching,
  });

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
      type: "genre" as const,
      slug: slug ?? "",
      name: genreName,
    }),
    [slug, genreName]
  );

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={genreName} />
        <GenreSongsPageSkeleton />
      </YStack>
    );
  }

  if (isError && songs.length === 0) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={genreName} />
        <ConnectionErrorState {...connectionErrorProps} />
      </YStack>
    );
  }

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={genreName} />
      <QueueProvider songs={songs} source={queueSource}>
        <FlatList
          data={songs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
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
