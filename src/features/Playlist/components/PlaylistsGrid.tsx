import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import { useNetwork } from "src/contexts/NetworkContext";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  useConnectionErrorProps,
  useRefreshable,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import LibraryCard from "src/features/Library/components/LibraryCard";
import LibraryGridSkeleton from "src/features/Library/skeletons/LibraryGridSkeleton";
import {
  LIBRARY_GRID_COLUMN_WRAPPER_STYLE,
  LIBRARY_ROW_WRAPPER_STYLE,
} from "src/features/Library/libraryGridLayout";
import { verticalScale } from "src/utils/functions/dimensions";
import { usePlaylists } from "../hooks/usePlaylists";
import { getPlaylistsInfiniteQueryKey } from "../queries/playlistQuery";
import type { PlaylistListItem } from "../types/playlist.types";
import { getPlaylistCoverUrl } from "../constants/playlistCovers";
import PlaylistsEmptyState from "./PlaylistEmptyState";

const rowWrapperStyle = LIBRARY_ROW_WRAPPER_STYLE;

export default function PlaylistsGrid() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(16),
  });

  const {
    playlists,
    isPending,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = usePlaylists();

  const listContentStyle = useMemo(
    () => ({
      paddingBottom: scrollBottomPadding,
    }),
    [scrollBottomPadding]
  );

  const { refreshControl } = useRefreshable({
    queryKeys: getPlaylistsInfiniteQueryKey(),
  });

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: isAuthenticated && hasNextPage,
    isLoadingMore,
  });

  const connectionErrorProps = useConnectionErrorProps({
    isOffline,
    refetch,
    isFetching,
  });

  const handlePress = useCallback(
    (item: PlaylistListItem) => {
      router.push(
        `/library/playlist/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}`
      );
    },
    [router]
  );

  const renderItem = useCallback<ListRenderItem<PlaylistListItem>>(
    ({ item }) => (
      <View style={rowWrapperStyle}>
        <LibraryCard
          id={item.id}
          imageUrl={getPlaylistCoverUrl(item.coverUrl, item.id)}
          title={item.name}
          subtitle={
            item.songCount === 1 ? "1 song" : `${item.songCount} songs`
          }
          onPress={() => handlePress(item)}
        />
      </View>
    ),
    [handlePress]
  );

  const keyExtractor = useCallback((item: PlaylistListItem) => item.id, []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  if (!isAuthenticated) {
    return (
      <PlaylistsEmptyState
        bottomPadding={scrollBottomPadding}
        isAuthenticated={false}
      />
    );
  }

  const showInitialSkeleton =
    isPending || isLoading || (isFetching && playlists.length === 0);

  if (showInitialSkeleton) {
    return (
      <View style={styles.flex}>
        <LibraryGridSkeleton contentBottomPadding={scrollBottomPadding} />
      </View>
    );
  }

  if (isError) {
    return <ConnectionErrorState {...connectionErrorProps} />;
  }

  if (playlists.length === 0) {
    return <PlaylistsEmptyState bottomPadding={scrollBottomPadding} />;
  }

  return (
    <FlatList
      style={styles.flex}
      data={playlists}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={LIBRARY_GRID_COLUMN_WRAPPER_STYLE}
      contentContainerStyle={listContentStyle}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={listFooter}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
