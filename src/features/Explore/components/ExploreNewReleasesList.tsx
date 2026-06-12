import { memo, useCallback, useMemo } from "react";
import { FlatList, ListRenderItem, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import SearchPageSkeleton from "../skeletons/SearchPageSkeleton";
import RecentSearchesSection from "./RecentSearchesSection";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import { getNewReleases } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getNewReleaseSongs } from "src/types/newReleases.types";
import {
  NEW_RELEASES_DISPLAY_LIMIT_EXPLORE,
  NEW_RELEASES_QUEUE_FETCH_LIMIT,
} from "src/utils/constants/newReleases";

const STALE_TIME_MS = 60_000;

interface ExploreNewReleasesListProps {
  onSelectRecentSearch: (term: string) => void;
}

function ExploreNewReleasesList({
  onSelectRecentSearch,
}: ExploreNewReleasesListProps) {
  const router = useRouter();

  const handleSeeAll = useCallback(() => {
    router.push("/home/new-releases" as never);
  }, [router]);

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "newReleases",
      NEW_RELEASES_QUEUE_FETCH_LIMIT,
      "song",
      "explore",
    ],
    queryFn: () =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
        type: "song",
      }),
    staleTime: STALE_TIME_MS,
  });

  const allSongs = useMemo(
    () => getNewReleaseSongs(data?.data?.results ?? []),
    [data?.data?.results]
  );

  const displaySongs = useMemo(
    () => allSongs.slice(0, NEW_RELEASES_DISPLAY_LIMIT_EXPLORE),
    [allSongs]
  );

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      await refetch();
    },
  });

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const queueSource = useMemo(
    () => ({ type: "newReleases" as const, scope: "explore" as const }),
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const listHeader = useMemo(
    () => (
      <YStack mt={verticalScale(6)}>
        <RecentSearchesSection onSelect={onSelectRecentSearch} />
        <XStack
          px={scale(20)}
          mb={verticalScale(6)}
          justify="space-between"
          items="center"
        >
          <MyText
            fontSize={moderateScale(18)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
          >
            New Releases
          </MyText>
          <Pressable onPress={handleSeeAll}>
            <MyText
              fontSize={moderateScale(14)}
              color={themeColors.dark.accent}
            >
              See All
            </MyText>
          </Pressable>
        </XStack>
      </YStack>
    ),
    [onSelectRecentSearch, handleSeeAll]
  );

  if (isLoading) {
    return <SearchPageSkeleton />;
  }

  if (isError) {
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center" }}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          px={scale(20)}
          py={verticalScale(24)}
          style={{ alignSelf: "center" }}
        >
          <MyText
            fontSize={moderateScale(14)}
            color={themeColors.dark.textMuted}
            textAlign="center"
          >
            Failed to load new releases
          </MyText>
        </YStack>
      </ScrollView>
    );
  }

  return (
    <QueueProvider songs={allSongs} source={queueSource}>
      <FlatList
        data={displaySongs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        refreshControl={refreshControl}
        initialNumToRender={NEW_RELEASES_DISPLAY_LIMIT_EXPLORE}
        maxToRenderPerBatch={NEW_RELEASES_DISPLAY_LIMIT_EXPLORE}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{
          paddingBottom: scrollBottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <YStack
            px={scale(20)}
            py={verticalScale(24)}
            style={{ alignItems: "center" }}
          >
            <MyText
              fontSize={moderateScale(14)}
              color={themeColors.dark.textMuted}
            >
              No new releases right now
            </MyText>
          </YStack>
        }
      />
    </QueueProvider>
  );
}

export default memo(ExploreNewReleasesList);
