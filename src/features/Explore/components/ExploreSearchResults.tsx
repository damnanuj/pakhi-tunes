import { memo, useCallback, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import SearchResultsHeader from "./SearchResultsHeader";
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
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const isDebouncing = query !== debouncedQuery && query.length > 0;

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

  const top = firstPage?.data.top ?? [];
  const albums = firstPage?.data.albums ?? [];
  const artists = firstPage?.data.artists ?? [];
  const playlists = firstPage?.data.playlists ?? [];
  const topSongIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of top) {
      if (item.type === "song") ids.add(item.id);
    }
    return ids;
  }, [top]);
  const listSongs = useMemo(
    () => songs.filter((song) => !topSongIds.has(song.id)),
    [songs, topSongIds]
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

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong, index: number) =>
      `${item.id || item.encrypted_id}-${index}`,
    []
  );

  const listHeader = useMemo(
    () => (
      <SearchResultsHeader
        top={top}
        artists={artists}
        albums={albums}
        playlists={playlists}
        showSongsTitle={listSongs.length > 0}
      />
    ),
    [albums, artists, listSongs.length, playlists, top]
  );

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const showSkeleton =
    isDebouncing || isLoading || (isFetching && songs.length === 0 && top.length === 0);

  const hasAnyResults =
    songs.length > 0 ||
    albums.length > 0 ||
    artists.length > 0 ||
    playlists.length > 0 ||
    top.length > 0;

  const showNoResults =
    !showSkeleton && !isError && debouncedQuery.length > 0 && !hasAnyResults;

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
      data={listSongs}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={12}
      maxToRenderPerBatch={8}
      windowSize={7}
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
