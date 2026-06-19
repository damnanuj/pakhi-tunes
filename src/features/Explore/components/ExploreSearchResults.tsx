import { memo, useCallback } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import {
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { getSongSearch } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { SongSearchResponse } from "src/types/songSearch.types";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";

const PAGE_SIZE = 20;

function getItems(res: SongSearchResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: SongSearchResponse,
  _allPages: SongSearchResponse[]
): number | undefined {
  return getNextOffsetFromPagination<ArtistSong>(res, PAGE_SIZE);
}

interface ExploreSearchResultsProps {
  query: string;
  debouncedQuery: string;
}

function ExploreSearchResults({
  query,
  debouncedQuery,
}: ExploreSearchResultsProps) {
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const isDebouncing = query !== debouncedQuery && query.length > 0;

  const {
    items: songs,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useInfinitePaginatedQuery<ArtistSong, SongSearchResponse>({
    queryKey: ["songSearch", debouncedQuery, PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getSongSearch({
        q: debouncedQuery,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: PAGE_SIZE,
    enabled: debouncedQuery.length > 0,
  });

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      if (debouncedQuery.length > 0) {
        await refetch();
      }
    },
  });

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong, index: number) =>
      `${item.encrypted_id ?? item.id}-${index}`,
    []
  );

  const showSkeleton =
    isDebouncing || isLoading || (isFetching && songs.length === 0);

  const showNoResults =
    !showSkeleton && !isError && debouncedQuery.length > 0 && songs.length === 0;

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (showSkeleton) {
    return <SearchPageSkeleton />;
  }

  if (isError && songs.length === 0) {
    return (
      <ConnectionErrorState
        variant={
          isNetworkRelatedError(error, isOffline) ? "offline" : "error"
        }
        subtitle="We couldn't load search results. Please try again."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (showNoResults) {
    return (
      <YStack flex={1} px={scale(20)} pt={verticalScale(24)}>
        <MyText
          fontSize={moderateScale(14)}
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          No results for &quot;{debouncedQuery}&quot;
        </MyText>
      </YStack>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListFooterComponent={listFooter}
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={PAGE_SIZE}
      maxToRenderPerBatch={PAGE_SIZE}
      windowSize={5}
      removeClippedSubviews
      contentContainerStyle={{
        paddingBottom: scrollBottomPadding,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

export default memo(ExploreSearchResults);
