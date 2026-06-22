import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
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
import { useHistoryList } from "../hooks/useHistoryList";
import { getHistoryInfiniteQueryKey } from "../queries/historyQuery";
import HistoryPageSkeleton from "../skeletons/HistoryPageSkeleton";
import HistoryEmptyState from "./HistoryEmptyState";
import { historyToQueueStub } from "../utils/historyToQueueStub";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import { clearHistory, removeHistory } from "../services/history.service";
import {
  clearHistoryListCache,
  removeHistoryFromListCache,
} from "../utils/historyCacheUpdates";

const HISTORY_QUEUE_SOURCE = {
  type: "history" as const,
  name: "Recent",
};

export default function LibraryRecentList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isOffline } = useNetwork();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const {
    history,
    isLoading,
    isError,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useHistoryList();

  const queueSongs = useMemo(
    () => history.map(historyToQueueStub),
    [history]
  );

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(16),
  });

  const { refreshControl } = useRefreshable({
    queryKeys: getHistoryInfiniteQueryKey(),
  });

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: isAuthenticated && hasNextPage,
    isLoadingMore,
  });

  const handleRemoveFromHistory = useCallback(
    async (songId: string) => {
      try {
        useLocalHistoryStore.getState().remove(songId);

        if (isAuthenticated) {
          await removeHistory(songId);
          removeHistoryFromListCache(queryClient, songId);
        }
      } catch (deleteError) {
        console.warn("History delete failed", deleteError);
      }
    },
    [isAuthenticated, queryClient]
  );

  const handleClearConfirm = useCallback(async () => {
    try {
      useLocalHistoryStore.getState().clearAll();

      if (isAuthenticated) {
        await clearHistory();
        clearHistoryListCache(queryClient);
      }
    } catch (clearError) {
      console.warn("History clear failed", clearError);
    }
  }, [isAuthenticated, queryClient]);

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => (
      <SongListItem
        song={item}
        onRemoveFromHistory={() => void handleRemoveFromHistory(item.id)}
      />
    ),
    [handleRemoveFromHistory]
  );

  const keyExtractor = useCallback((item: ArtistSong) => getSongListKey(item), []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const listEmptyComponent = useMemo(
    () =>
      !isLoading && !isError ? (
        <HistoryEmptyState
          variant="recent"
          bottomPadding={scrollBottomPadding}
        />
      ) : null,
    [isError, isLoading, scrollBottomPadding]
  );

  const listHeaderComponent = useMemo(() => {
    if (history.length === 0) {
      if (!isAuthenticated) return null;

      return (
        <YStack px={scale(20)} pt={verticalScale(4)} pb={verticalScale(8)}>
          <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
            Sign in to back up your listening history across devices.
          </MyText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth",
                params: {
                  mode: "signin",
                  redirect: "/(tabs)/library",
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

    return (
      <YStack>
        {!isAuthenticated ? (
          <YStack px={scale(20)} pt={verticalScale(4)} pb={verticalScale(8)}>
            <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
              Sign in to back up your listening history across devices.
            </MyText>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/auth",
                  params: {
                    mode: "signin",
                    redirect: "/(tabs)/library",
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

        <XStack
          px={scale(20)}
          pb={verticalScale(8)}
          justify="space-between"
          items="center"
        >
          <MyText
            fontSize={moderateScale(14)}
            weight="600"
            color={themeColors.dark.textMuted}
          >
            Recently played
          </MyText>
          <TouchableOpacity
            onPress={() => setShowClearConfirm(true)}
            activeOpacity={0.85}
          >
            <MyText color={themeColors.dark.accent} weight="600">
              Clear all
            </MyText>
          </TouchableOpacity>
        </XStack>
      </YStack>
    );
  }, [history.length, isAuthenticated, router]);

  if (isLoading) {
    return <HistoryPageSkeleton />;
  }

  if ((isError || (isOffline && history.length === 0)) && history.length === 0) {
    return (
      <ConnectionErrorState
        variant={isNetworkRelatedError(error, isOffline) ? "offline" : "error"}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <QueueProvider songs={queueSongs} source={HISTORY_QUEUE_SOURCE}>
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

        <ConfirmDialog
          open={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          title="Clear listening history?"
          message="This removes all songs from your history. This cannot be undone."
          confirmLabel="Clear all"
          onConfirm={handleClearConfirm}
        />
      </YStack>
    </QueueProvider>
  );
}
