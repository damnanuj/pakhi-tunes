import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { YStack } from "tamagui";
import ScreenHeader from "src/components/ScreenHeader";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
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
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { useHistoryList } from "../hooks/useHistoryList";
import HistoryPageSkeleton from "../skeletons/HistoryPageSkeleton";
import HistorySongListItem from "../components/HistorySongListItem";
import HistoryEmptyState from "../components/HistoryEmptyState";
import { historyToQueueStub } from "../utils/historyToQueueStub";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import { clearHistory, removeHistory } from "../services/history.service";
import {
  clearHistoryListCache,
  removeHistoryFromListCache,
} from "../utils/historyCacheUpdates";

const HISTORY_QUEUE_SOURCE = {
  type: "history" as const,
  name: "Listening history",
};

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isOffline } = useNetwork();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);

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

  const handleDelete = useCallback(
    async (songId: string) => {
      setDeletingSongId(songId);
      try {
        useLocalHistoryStore.getState().remove(songId);

        if (isAuthenticated) {
          await removeHistory(songId);
          removeHistoryFromListCache(queryClient, songId);
        }
      } catch (deleteError) {
        console.warn("History delete failed", deleteError);
      } finally {
        setDeletingSongId(null);
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
      <HistorySongListItem
        song={item}
        onDelete={handleDelete}
        isDeleting={deletingSongId === item.id}
      />
    ),
    [deletingSongId, handleDelete]
  );

  const keyExtractor = useCallback((item: ArtistSong) => getSongListKey(item), []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const clearAllButton =
    history.length > 0 ? (
      <TouchableOpacity
        onPress={() => setShowClearConfirm(true)}
        activeOpacity={0.85}
      >
        <MyText color={themeColors.dark.accent} weight="600">
          Clear all
        </MyText>
      </TouchableOpacity>
    ) : null;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader
        title="History"
        showBack
        showSettings={false}
        rightContent={clearAllButton}
      />

      {!isAuthenticated ? (
        <YStack px={scale(20)} pt={verticalScale(12)} pb={verticalScale(4)}>
          <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
            Sign in to back up your listening history across devices.
          </MyText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth",
                params: {
                  mode: "signin",
                  redirect: "/(tabs)/library/history",
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
        <HistoryPageSkeleton />
      ) : (isError || (isOffline && history.length === 0)) &&
        history.length === 0 ? (
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : history.length === 0 ? (
        <HistoryEmptyState
          variant="full"
          bottomPadding={scrollBottomPadding}
        />
      ) : (
        <QueueProvider songs={queueSongs} source={HISTORY_QUEUE_SOURCE}>
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

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear listening history?"
        message="This removes all songs from your history. This cannot be undone."
        confirmLabel="Clear all"
        onConfirm={handleClearConfirm}
      />
    </YStack>
  );
}
