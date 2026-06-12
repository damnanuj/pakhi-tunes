import { memo, useCallback } from "react";
import { FlatList, ListRenderItem, ScrollView } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { SongListItemSkeleton } from "src/features/ArtistSongs/skeletons/ArtistSongsPageSkeleton";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import {
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
} from "src/hooks";
import { getSongSearch } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { SongSearchResponse } from "src/types/songSearch.types";

const PAGE_SIZE = 20;

function getItems(res: SongSearchResponse) {
  return res.data.results;
}

function getNextPageParam(res: SongSearchResponse): number | undefined {
  const { next, currentPage } = res.data;
  if (!next) return undefined;
  return currentPage * PAGE_SIZE;
}

interface ExploreSearchResultsProps {
  query: string;
  debouncedQuery: string;
}

function ExploreSearchResults({
  query,
  debouncedQuery,
}: ExploreSearchResultsProps) {
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const showSkeleton =
    isDebouncing || isLoading || (isFetching && songs.length === 0);

  const showNoResults =
    !showSkeleton && !isError && debouncedQuery.length > 0 && songs.length === 0;

  const listFooter = isFetchingNextPage ? (
    <YStack py={verticalScale(8)}>
      {Array.from({ length: 5 }, (_, i) => (
        <SongListItemSkeleton key={i} />
      ))}
    </YStack>
  ) : null;

  if (showSkeleton) {
    return <SearchPageSkeleton />;
  }

  if (isError) {
    return (
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
            Failed to load search results
          </MyText>
        </YStack>
      </ScrollView>
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
      onEndReached={handleEndReached}
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
