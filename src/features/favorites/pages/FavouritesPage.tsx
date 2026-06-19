import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import ScreenHeader from "src/components/ScreenHeader";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import MyText from "src/components/MyText";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import {
  useRefreshable,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { useFavoritesList } from "../hooks/useFavorites";
import FavouritesPageSkeleton from "../skeletons/FavouritesPageSkeleton";
import { favoriteToQueueStub } from "../utils/favoriteToQueueStub";

const FAVORITES_QUEUE_SOURCE = {
  type: "favorites" as const,
  name: "Favourites",
};

export default function FavouritesPage() {
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
    extra: verticalScale(32),
  });

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      if (!isAuthenticated) return;
      await refetch();
    },
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

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Favourites" showBack showSettings={false} />

      {!isAuthenticated ? (
        <YStack px={scale(20)} pt={verticalScale(12)} pb={verticalScale(4)}>
          <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
            Sign in to back up your favourites across devices.
          </MyText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth",
                params: {
                  mode: "signin",
                  redirect: "/(tabs)/profile/favourites",
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
      ) : null}

      {isLoading ? (
        <FavouritesPageSkeleton />
      ) : (isError || (isOffline && favorites.length === 0)) &&
        favorites.length === 0 ? (
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : favorites.length === 0 ? (
        <YStack px={scale(20)} py={verticalScale(24)}>
          <MyText color={themeColors.dark.textMuted}>
            Songs you favourite will appear here.
          </MyText>
        </YStack>
      ) : (
        <QueueProvider songs={queueSongs} source={FAVORITES_QUEUE_SOURCE}>
          <FlatList
            data={queueSongs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListFooterComponent={listFooter}
            refreshControl={isAuthenticated ? refreshControl : undefined}
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
      )}
    </YStack>
  );
}
