import { useCallback } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset } from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { useRecentHistory } from "../hooks/useRecentHistory";
import HistoryEmptyState from "./HistoryEmptyState";

const RECENT_QUEUE_SOURCE = {
  type: "history" as const,
  name: "Recent",
};

export default function LibraryRecentList() {
  const router = useRouter();
  const recentSongs = useRecentHistory();

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(16),
  });

  const handleSeeAll = useCallback(() => {
    router.push("/(tabs)/library/history");
  }, [router]);

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback((item: ArtistSong) => getSongListKey(item), []);

  if (recentSongs.length === 0) {
    return (
      <HistoryEmptyState
        variant="recent"
        bottomPadding={scrollBottomPadding}
      />
    );
  }

  return (
    <QueueProvider songs={recentSongs} source={RECENT_QUEUE_SOURCE}>
      <YStack flex={1}>
        <XStack
          px={scale(20)}
          pb={verticalScale(8)}
          justify="space-between"
          items="center"
        >
          <MyText
            fontSize={moderateScale(14)}
            weight="600"
            color={themeColors.dark.textMuted}
          >
            Recently played
          </MyText>
          <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.85}>
            <MyText color={themeColors.dark.accent} weight="600">
              See all
            </MyText>
          </TouchableOpacity>
        </XStack>

        <FlatList
          data={recentSongs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
        />
      </YStack>
    </QueueProvider>
  );
}
