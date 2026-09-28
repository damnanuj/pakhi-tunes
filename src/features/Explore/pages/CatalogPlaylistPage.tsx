import { useCallback, useMemo } from "react";
import { FlatList, Image, ListRenderItem } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import { useNetwork } from "src/contexts/NetworkContext";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import {
  useConnectionErrorProps,
  useRefreshable,
  useInfinitePaginatedQuery,
  useScrollBottomInset,
  useScrollEndReached,
} from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import ArtistSongsPageSkeleton from "src/features/ArtistSongs/skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { getCatalogPlaylistQueryOptions } from "../queries/catalogPlaylistQuery";

const COVER_SIZE = moderateScale(120);

export default function CatalogPlaylistPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: 0,
  });

  const {
    items: songs,
    firstPage,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isLoadingMore,
    refetch,
  } = useInfinitePaginatedQuery({
    ...getCatalogPlaylistQueryOptions(id ?? ""),
    enabled: !!id,
  });

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      await refetch();
    },
  });
  const connectionErrorProps = useConnectionErrorProps({
    isOffline,
    refetch,
    isFetching,
  });

  const playlist = firstPage?.data?.playlist;
  const headerTitle = playlist
    ? decodeHtmlEntities(playlist.name)
    : name
      ? decodeHtmlEntities(name)
      : "Playlist";

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const queueSource = useMemo(
    () => ({
      type: "playlist" as const,
      id: id ?? "",
      name: headerTitle,
    }),
    [headerTitle, id]
  );

  const { onScroll, onEndReached } = useScrollEndReached(fetchNextPage, {
    enabled: hasNextPage,
    isLoadingMore,
  });

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if ((isError || !playlist) && songs.length === 0) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
        <ConnectionErrorState
          {...connectionErrorProps}
          subtitle={
            isOffline
              ? undefined
              : "We couldn't load this playlist. Please try again."
          }
        />
      </YStack>
    );
  }

  const cover = getSongCoverUrl(playlist?.image ?? [], "500x500");
  const subtitle = playlist?.subtitle
    ? decodeHtmlEntities(playlist.subtitle)
    : "";

  const listHeader = (
    <YStack items="center" px={scale(20)} pb={verticalScale(16)}>
      <Image
        source={cover ? { uri: cover } : undefined}
        style={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          borderRadius: moderateScale(12),
          backgroundColor: themeColors.dark.surfaceSecondary,
        }}
        resizeMode="cover"
      />
      <MyText
        fontSize={moderateScale(18)}
        weight="700"
        color={themeColors.dark.onSurface}
        textAlign="center"
        mt={verticalScale(12)}
      >
        {headerTitle}
      </MyText>
      {subtitle ? (
        <MyText
          fontSize={moderateScale(13)}
          weight="500"
          color={themeColors.dark.textMuted}
          mt={verticalScale(4)}
        >
          {subtitle}
        </MyText>
      ) : null}
    </YStack>
  );

  const listFooter = isLoadingMore ? <ListFooterSpinner /> : null;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={headerTitle} />
      <QueueProvider songs={songs} source={queueSource}>
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
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
          showsVerticalScrollIndicator={false}
        />
      </QueueProvider>
    </YStack>
  );
}
