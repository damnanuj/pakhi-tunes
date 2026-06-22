import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { YStack } from "tamagui";
import { Download as DownloadIcon } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { useScrollBottomInset } from "src/hooks";
import { useDownloadStore } from "../store/downloadStore";
import {
  formatFileSize,
  getTotalDownloadSize,
} from "../utils/storageUtils";
import DownloadSongItem from "./DownloadSongItem";
import type { DownloadedSong } from "../types/download.types";

export default function DownloadsList() {
  const songsRecord = useDownloadStore((s) => s.songs);
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });

  const sortedSongs = useMemo(
    () =>
      Object.values(songsRecord).sort(
        (a, b) => b.downloadedAt - a.downloadedAt
      ),
    [songsRecord]
  );

  const totalSize = useMemo(
    () => getTotalDownloadSize(sortedSongs),
    [sortedSongs]
  );

  const keyExtractor = useCallback((item: DownloadedSong) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: DownloadedSong }) => <DownloadSongItem song={item} />,
    []
  );

  const listContentStyle = useMemo(
    () => ({
      paddingBottom: scrollBottomPadding,
      flexGrow: 1,
    }),
    [scrollBottomPadding]
  );

  if (sortedSongs.length === 0) {
    return (
      <YStack
        flex={1}
        items="center"
        justify="center"
        px={scale(32)}
        gap={verticalScale(16)}
        pb={scrollBottomPadding}
      >
        <View
          style={{
            width: moderateScale(80),
            height: moderateScale(80),
            borderRadius: moderateScale(40),
            backgroundColor: themeColors.dark.surfaceSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DownloadIcon
            size={moderateScale(36)}
            color={themeColors.dark.textMuted}
          />
        </View>
        <MyText
          fontSize={moderateScale(18)}
          weight="700"
          color={themeColors.dark.onSurface}
          textAlign="center"
        >
          No downloads yet
        </MyText>
        <MyText
          fontSize={moderateScale(14)}
          weight="400"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          Tap the download button on any song in the player to save it for
          offline listening.
        </MyText>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      <YStack px={scale(20)} pb={verticalScale(12)} gap={verticalScale(4)}>
        <MyText
          fontSize={moderateScale(13)}
          weight="600"
          color={themeColors.dark.textMuted}
        >
          {sortedSongs.length} song{sortedSongs.length === 1 ? "" : "s"} ·{" "}
          {formatFileSize(totalSize)} used
        </MyText>
      </YStack>
      <FlatList
        style={styles.flex}
        data={sortedSongs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
