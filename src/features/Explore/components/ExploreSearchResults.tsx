import { memo, useCallback, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import SearchEntityRow from "./SearchEntityRow";
import SearchSectionTitleRow from "./SearchSectionTitleRow";
import {
  useConnectionErrorProps,
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { getSongSearch } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { SongSearchResponse } from "src/types/songSearch.types";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";
import {
  buildSearchListRows,
  type SearchListRow,
} from "../utils/searchResultsListModel";

const PAGE_SIZE = 20;
const LIST_WINDOW = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  windowSize: 5,
} as const;

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
  debouncedQuery,
}: ExploreSearchResultsProps) {
  const router = useRouter();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

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

  const top = firstPage?.data.top ?? [];
  const albums = firstPage?.data.albums ?? [];
  const artists = firstPage?.data.artists ?? [];
  const playlists = firstPage?.data.playlists ?? [];

  const listRows = useMemo(
    () =>
      buildSearchListRows({
        top,
        artists,
        albums,
        playlists,
        songs,
      }),
    [albums, artists, playlists, songs, top]
  );

  const openEntity = useCallback(
    (row: Extract<SearchListRow, { kind: "entity" }>) => {
      switch (row.target) {
        case "artist":
          router.push({
            pathname: "/explore/artist/[id]",
            params: { id: row.routeId, name: row.routeName ?? row.name },
          });
          break;
        case "album":
          router.push({
            pathname: "/explore/album/[id]",
            params: { id: row.routeId },
          });
          break;
        case "playlist":
          router.push({
            pathname: "/explore/playlist/[id]",
            params: { id: row.routeId, name: row.routeName ?? row.name },
          });
          break;
        default: {
          const _exhaustive: never = row.target;
          return _exhaustive;
        }
      }
    },
    [router]
  );

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

  const renderItem: ListRenderItem<SearchListRow> = useCallback(
    ({ item }) => {
      switch (item.kind) {
        case "section":
          return <SearchSectionTitleRow label={item.label} />;
        case "entity":
          return (
            <SearchEntityRow
              name={item.name}
              subtitle={item.subtitle}
              image={item.image}
              roundImage={item.roundImage}
              onPress={() => openEntity(item)}
            />
          );
        case "song":
          return <SongListItem song={item.song} />;
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    },
    [openEntity]
  );

  const keyExtractor = useCallback((item: SearchListRow) => item.key, []);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const hasAnyResults = listRows.length > 0;

  const showSkeleton =
    !hasAnyResults &&
    !isPlaceholderData &&
    (isLoading || (isFetching && debouncedQuery.length > 0));

  const showNoResults =
    !showSkeleton &&
    !isError &&
    debouncedQuery.length > 0 &&
    !hasAnyResults &&
    !isFetching;

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (showSkeleton) {
    return <SearchPageSkeleton />;
  }

  if (isError && !hasAnyResults) {
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
    <FlatList
      data={listRows}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
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
  );
}

export default memo(ExploreSearchResults);
