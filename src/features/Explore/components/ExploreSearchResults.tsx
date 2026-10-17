import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import ExploreSearchTabs, { type SearchTabId } from "./ExploreSearchTabs";
import SearchCategoryGrid from "./SearchCategoryGrid";
import {
  useConnectionErrorProps,
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { getSongSearch } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type {
  SearchCategory,
  SongSearchResponse,
} from "src/types/songSearch.types";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";

const PAGE_SIZE = 20;
const LIST_WINDOW = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  windowSize: 5,
} as const;

const TAB_GAP = verticalScale(16);

function getItems(res: SongSearchResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: SongSearchResponse,
  _allPages: SongSearchResponse[]
): number | undefined {
  return getNextOffsetFromPagination<ArtistSong>(res, PAGE_SIZE);
}

function buildAvailableTabs(firstPage: SongSearchResponse | undefined): SearchTabId[] {
  const tabs: SearchTabId[] = ["songs"];
  const data = firstPage?.data;
  if ((data?.albums?.length ?? 0) > 0) tabs.push("albums");
  if ((data?.artists?.length ?? 0) > 0) tabs.push("artists");
  if ((data?.playlists?.length ?? 0) > 0) tabs.push("playlists");
  return tabs;
}

interface ExploreSearchResultsProps {
  query: string;
  debouncedQuery: string;
}

function ExploreSearchResults({
  debouncedQuery,
}: ExploreSearchResultsProps) {
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const [activeTab, setActiveTab] = useState<SearchTabId>("songs");

  useEffect(() => {
    setActiveTab("songs");
  }, [debouncedQuery]);

  const {
    items: songs,
    firstPage,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
    isPlaceholderData,
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
    getItemKey: (song) => song.id,
    enabled: debouncedQuery.length > 0,
    keepPreviousData: true,
  });

  const availableTabs = useMemo(
    () => buildAvailableTabs(firstPage),
    [firstPage]
  );

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] ?? "songs");
    }
  }, [activeTab, availableTabs]);

  const showCategoryTabs = availableTabs.length > 1;

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      if (debouncedQuery.length > 0) {
        await refetch();
      }
    },
  });
  const connectionErrorProps = useConnectionErrorProps({
    isOffline: false,
    refetch,
    isFetching,
  });

  const renderSongItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback((item: ArtistSong) => item.id, []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const hasSongResults = songs.length > 0;
  const hasCategoryPreview = availableTabs.length > 1;

  const showSkeleton =
    !hasSongResults &&
    !hasCategoryPreview &&
    !isPlaceholderData &&
    (isLoading || (isFetching && debouncedQuery.length > 0));

  const showNoResults =
    !showSkeleton &&
    !isError &&
    debouncedQuery.length > 0 &&
    !hasSongResults &&
    !hasCategoryPreview &&
    !isFetching;

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage && activeTab === "songs",
    isLoadingMore,
  });

  if (showSkeleton) {
    return <SearchPageSkeleton />;
  }

  if (isError && !hasSongResults && !hasCategoryPreview) {
    return (
      <ConnectionErrorState
        {...connectionErrorProps}
        subtitle="We couldn't load search results. Please try again."
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
    <YStack flex={1}>
      {showCategoryTabs ? (
        <View style={{ marginBottom: TAB_GAP }}>
          <ExploreSearchTabs
            availableTabs={availableTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>
      ) : null}

      {activeTab === "songs" ? (
        <FlatList
          data={songs}
          keyExtractor={keyExtractor}
          renderItem={renderSongItem}
          ListEmptyComponent={
            hasCategoryPreview ? (
              <YStack px={scale(20)} pt={verticalScale(24)}>
                <MyText
                  fontSize={moderateScale(14)}
                  color={themeColors.dark.textMuted}
                  textAlign="center"
                >
                  No songs found. Check other tabs for results.
                </MyText>
              </YStack>
            ) : null
          }
          ListFooterComponent={listFooter}
          refreshControl={refreshControl}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          initialNumToRender={LIST_WINDOW.initialNumToRender}
          maxToRenderPerBatch={LIST_WINDOW.maxToRenderPerBatch}
          windowSize={LIST_WINDOW.windowSize}
          removeClippedSubviews
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <SearchCategoryGrid
          debouncedQuery={debouncedQuery}
          type={activeTab as SearchCategory}
          enabled
        />
      )}
    </YStack>
  );
}

export default memo(ExploreSearchResults);
