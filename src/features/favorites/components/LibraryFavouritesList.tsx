import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import {
  useRefreshable,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { useFavoritesList } from "../hooks/useFavorites";
import { getFavoritesInfiniteQueryKey } from "../queries/favoritesQuery";
import FavouritesPageSkeleton from "../skeletons/FavouritesPageSkeleton";
import FavouritesEmptyState from "./FavouritesEmptyState";
import { favoriteToQueueStub } from "../utils/favoriteToQueueStub";

const FAVORITES_QUEUE_SOURCE = {
  type: "favorites" as const,
  name: "Favourites",
};

const SIGN_IN_REDIRECT = "/(tabs)/library?tab=favorites";

export default function LibraryFavouritesList() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isOffline } = useNetwork();
  const {
    favorites,
    isLoading,
    isError,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useFavoritesList();

  const queueSongs = useMemo(
    () => favorites.map(favoriteToQueueStub),
    [favorites]
  );

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(16),
  });

  const { refreshControl } = useRefreshable({
    queryKeys: getFavoritesInfiniteQueryKey(),
  });

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: isAuthenticated && hasNextPage,
    isLoadingMore,
  });

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback((item: ArtistSong) => getSongListKey(item), []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const listEmptyComponent = useMemo(
    () =>
      !isLoading && !isError ? (
        <FavouritesEmptyState bottomPadding={scrollBottomPadding} />
      ) : null,
    [isError, isLoading, scrollBottomPadding]
  );

  const listHeaderComponent = useMemo(() => {
    if (!isAuthenticated) {
      return (
        <YStack px={scale(20)} pt={verticalScale(4)} pb={verticalScale(8)}>
          <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
            Sign in to back up your favourites across devices.
          </MyText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth",
                params: {
                  mode: "signin",
                  redirect: SIGN_IN_REDIRECT,
                },
              })
            }
            activeOpacity={0.85}
            style={{ marginTop: verticalScale(8), alignSelf: "flex-start" }}
          >
            <MyText color={themeColors.dark.accent} weight="600">
              Sign in
            </MyText>
          </TouchableOpacity>
        </YStack>
      );
    }

    return null;
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <FavouritesPageSkeleton />;
  }

  if ((isError || (isOffline && favorites.length === 0)) && favorites.length === 0) {
    return (
      <ConnectionErrorState
        variant={isNetworkRelatedError(error, isOffline) ? "offline" : "error"}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <QueueProvider songs={queueSongs} source={FAVORITES_QUEUE_SOURCE}>
      <YStack flex={1}>
        <FlatList
          data={queueSongs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={listFooter}
          refreshControl={isAuthenticated ? refreshControl : undefined}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
            flexGrow: queueSongs.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
        />
      </YStack>
    </QueueProvider>
  );
}
