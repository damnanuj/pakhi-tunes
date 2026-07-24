import { useCallback, useMemo } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { YStack } from "tamagui";
import { ListMusic } from "@tamagui/lucide-icons";
import themeColors from "src/utils/theme/colors";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import { appToast } from "src/components/toast/appToastHelpers";
import { useNetwork } from "src/contexts/NetworkContext";
import {
  useConnectionErrorProps,
  useRefreshable,
  useScrollBottomInset,
} from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { usePlaylistDetail } from "../hooks/usePlaylistDetail";
import { playlistSongToQueueStub } from "../utils/playlistSongToQueueStub";
import PlaylistDetailHeader from "../components/PlaylistDetailHeader";
import PlaylistDetailSkeleton from "../skeletons/PlaylistDetailSkeleton";
import { getPlaylistCoverUrl } from "../constants/playlistCovers";
import { removeSongFromPlaylist } from "../services/playlist.service";
import {
  PLAYLISTS_QUERY_KEY,
  getPlaylistDetailQueryKey,
} from "../queries/playlistQuery";

export default function PlaylistDetailPage() {
  const { id, name: nameParam } = useLocalSearchParams<{
    id: string;
    name?: string;
  }>();
  const queryClient = useQueryClient();
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: 0,
  });

  const {
    data: playlist,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePlaylistDetail(id);

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

  const headerTitle = playlist?.name || nameParam || "Playlist";

  const songs = useMemo(
    () => (playlist?.songs ?? []).map(playlistSongToQueueStub),
    [playlist?.songs]
  );

  const queueSource = useMemo(
    () => ({
      type: "playlist" as const,
      id: id ?? "",
      name: headerTitle,
    }),
    [id, headerTitle]
  );

  const handleRemoveFromPlaylist = useCallback(
    async (song: ArtistSong) => {
      if (!id) return;
      const title = decodeHtmlEntities(song.name);
      await removeSongFromPlaylist(id, song.id);
      void queryClient.invalidateQueries({
        queryKey: getPlaylistDetailQueryKey(id),
      });
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      appToast.removedFromPlaylist(title);
    },
    [id, queryClient]
  );

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => (
      <SongListItem
        song={item}
        playlistName={headerTitle}
        onRemoveFromPlaylist={() => {
          void handleRemoveFromPlaylist(item);
        }}
      />
    ),
    [handleRemoveFromPlaylist, headerTitle]
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  // isPending covers first load; also show while fetching with no data yet
  // (React Query v5: isLoading = isPending && isFetching can miss disabled→enabled)
  if (isPending || (isFetching && !playlist)) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={headerTitle} />
        <PlaylistDetailSkeleton />
      </YStack>
    );
  }

  if (isError || !playlist) {
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

  const listHeader = (
    <PlaylistDetailHeader
      name={playlist.name}
      coverUrl={getPlaylistCoverUrl(playlist.coverUrl, playlist.id)}
      songCount={playlist.songCount}
    />
  );

  const emptyList = (
    <YStack
      items="center"
      justify="center"
      px={scale(32)}
      pt={verticalScale(40)}
      gap={verticalScale(12)}
    >
      <View
        style={{
          width: moderateScale(64),
          height: moderateScale(64),
          borderRadius: moderateScale(32),
          backgroundColor: themeColors.dark.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ListMusic
          size={moderateScale(28)}
          color={themeColors.dark.textMuted}
        />
      </View>
      <MyText
        fontSize={moderateScale(15)}
        weight="600"
        color={themeColors.dark.onSurface}
        textAlign="center"
      >
        No songs in this playlist
      </MyText>
      <MyText
        fontSize={moderateScale(13)}
        weight="400"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        Use Save to playlist on any song to add tracks here.
      </MyText>
    </YStack>
  );

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={headerTitle} />
      <QueueProvider songs={songs} source={queueSource}>
        <FlatList
          data={songs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyList}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
            flexGrow: songs.length === 0 ? 1 : undefined,
          }}
        />
      </QueueProvider>
    </YStack>
  );
}
