import { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
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
import LibraryCard from "src/features/Library/components/LibraryCard";
import LibraryGridSkeleton from "src/features/Library/skeletons/LibraryGridSkeleton";
import {
  LIBRARY_GRID_COLUMN_WRAPPER_STYLE,
  LIBRARY_ROW_WRAPPER_STYLE,
} from "src/features/Library/libraryGridLayout";
import {
  useConnectionErrorProps,
  useInfinitePaginatedQuery,
  useRefreshable,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import { getSearchCategory } from "src/services";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";
import type {
  SearchAlbumItem,
  SearchArtistItem,
  SearchCategory,
  SearchCategoryResponse,
  SearchPlaylistItem,
} from "src/types/songSearch.types";

const PAGE_SIZE = 20;

type CategoryItem = SearchAlbumItem | SearchArtistItem | SearchPlaylistItem;

interface SearchCategoryCardModel {
  key: string;
  id: string;
  routeId: string;
  routeName?: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  target: SearchCategory;
}

function mapCategoryItem(
  item: CategoryItem,
  type: SearchCategory
): SearchCategoryCardModel | null {
  const name = decodeHtmlEntities(item.name);
  if (!item.id || !name) return null;

  const cover = getSongCoverUrl(item.image, "500x500") ?? "";
  const subtitle = item.subtitle
    ? decodeHtmlEntities(item.subtitle)
    : undefined;

  if (type === "artists") {
    const artist = item as SearchArtistItem;
    return {
      key: `artist-${artist.id}`,
      id: artist.id,
      routeId: artist.encrypted_id || artist.id,
      routeName: name,
      imageUrl: cover,
      title: name,
      subtitle,
      target: "artists",
    };
  }

  if (type === "albums") {
    return {
      key: `album-${item.id}`,
      id: item.id,
      routeId: item.id,
      imageUrl: cover,
      title: name,
      subtitle,
      target: "albums",
    };
  }

  const playlist = item as SearchPlaylistItem;
  return {
    key: `playlist-${playlist.id}`,
    id: playlist.id,
    routeId: playlist.id,
    routeName: name,
    imageUrl: cover,
    title: name,
    subtitle,
    target: "playlists",
  };
}

function getItems(res: SearchCategoryResponse<CategoryItem>) {
  return res.data.results;
}

function getNextPageParam(
  res: SearchCategoryResponse<CategoryItem>,
  _allPages: SearchCategoryResponse<CategoryItem>[]
): number | undefined {
  return getNextOffsetFromPagination(res, PAGE_SIZE);
}

export interface SearchCategoryGridProps {
  debouncedQuery: string;
  type: SearchCategory;
  enabled: boolean;
}

function SearchCategoryGrid({
  debouncedQuery,
  type,
  enabled,
}: SearchCategoryGridProps) {
  const router = useRouter();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const {
    items,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
    isPlaceholderData,
  } = useInfinitePaginatedQuery<
    CategoryItem,
    SearchCategoryResponse<CategoryItem>
  >({
    queryKey: ["searchCategory", type, debouncedQuery, PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      getSearchCategory<CategoryItem>({
        q: debouncedQuery,
        type,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getItems,
    getNextPageParam,
    pageSize: PAGE_SIZE,
    getItemKey: (item) => item.id,
    enabled: enabled && debouncedQuery.length > 0,
    keepPreviousData: true,
  });

  const cardItems = useMemo(
    () =>
      items
        .map((item) => mapCategoryItem(item, type))
        .filter((item): item is SearchCategoryCardModel => item != null),
    [items, type]
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

  const openItem = useCallback(
    (item: SearchCategoryCardModel) => {
      switch (item.target) {
        case "artists":
          router.push({
            pathname: "/explore/artist/[id]",
            params: { id: item.routeId, name: item.routeName ?? item.title },
          });
          break;
        case "albums":
          router.push({
            pathname: "/explore/album/[id]",
            params: { id: item.routeId },
          });
          break;
        case "playlists":
          router.push({
            pathname: "/explore/playlist/[id]",
            params: { id: item.routeId, name: item.routeName ?? item.title },
          });
          break;
        default: {
          const _exhaustive: never = item.target;
          return _exhaustive;
        }
      }
    },
    [router]
  );

  const renderItem = useCallback<ListRenderItem<SearchCategoryCardModel>>(
    ({ item }) => (
      <View style={LIBRARY_ROW_WRAPPER_STYLE}>
        <LibraryCard
          id={item.id}
          imageUrl={item.imageUrl}
          title={item.title}
          subtitle={item.subtitle}
          onPress={() => openItem(item)}
        />
      </View>
    ),
    [openItem]
  );

  const keyExtractor = useCallback((item: SearchCategoryCardModel) => item.key, []);

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  const showSkeleton =
    cardItems.length === 0 &&
    !isPlaceholderData &&
    (isLoading || (isFetching && debouncedQuery.length > 0));

  const showNoResults =
    !showSkeleton &&
    !isError &&
    debouncedQuery.length > 0 &&
    cardItems.length === 0 &&
    !isFetching;

  if (showSkeleton) {
    return (
      <View style={styles.flex}>
        <LibraryGridSkeleton contentBottomPadding={scrollBottomPadding} />
      </View>
    );
  }

  if (isError && cardItems.length === 0) {
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
      style={styles.flex}
      data={cardItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={LIBRARY_GRID_COLUMN_WRAPPER_STYLE}
      ListFooterComponent={isLoadingMore ? <ListFooterSpinner /> : null}
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default memo(SearchCategoryGrid);
