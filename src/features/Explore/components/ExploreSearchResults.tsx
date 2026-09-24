import { memo, useCallback, useMemo } from "react";
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
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchAlbumsRow from "./SearchAlbumsRow";
import SearchArtistsRow from "./SearchArtistsRow";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
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

  const albums = firstPage?.data.albums ?? [];
  const artists = firstPage?.data.artists ?? [];

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
      `${item.encrypted_id ?? item.id}-${index}`,
    []
  );

  const listHeader = useMemo(() => {
    const hasAlbums = albums.length > 0;
    const hasArtists = artists.length > 0;
    const hasSongs = songs.length > 0;

    if (!hasAlbums && !hasArtists && !hasSongs) {
      return null;
    }

    return (
      <YStack>
        <SearchAlbumsRow albums={albums} />
        <SearchArtistsRow artists={artists} />
        {hasSongs ? (
          <YStack px={scale(20)} pb={verticalScale(8)}>
            <MyText
              fontSize={moderateScale(18)}
              fontWeight="600"
              color={themeColors.dark.onSurface}
            >
              Songs
            </MyText>
          </YStack>
        ) : null}
      </YStack>
    );
  }, [albums, artists, songs.length]);

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  const showSkeleton =
    isDebouncing || isLoading || (isFetching && songs.length === 0);

  const hasAnyResults =
    songs.length > 0 || albums.length > 0 || artists.length > 0;

  const showNoResults =
    !showSkeleton &&
    !isError &&
    debouncedQuery.length > 0 &&
    !hasAnyResults;

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
      data={songs}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
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
