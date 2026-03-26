import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import { getTopArtists } from "src/services";
import LibraryCard from "./LibraryCard";
import LibraryGridSkeleton from "../skeletons/LibraryGridSkeleton";
import {
  LIBRARY_GRID_COLUMN_WRAPPER_STYLE,
  LIBRARY_ROW_WRAPPER_STYLE,
} from "../libraryGridLayout";
import type { LibraryItem } from "../types/libraryItem";
import type { TopArtist } from "src/types/topArtists.types";

export const TOP_ARTISTS_LIMIT = 50;

export { LIBRARY_GRID_COLUMN_WRAPPER_STYLE } from "../libraryGridLayout";

const rowWrapperStyle = LIBRARY_ROW_WRAPPER_STYLE;

function mapArtistToLibraryItem(artist: TopArtist): LibraryItem {
  return {
    id: artist.encrypted_id,
    imageUrl: artist.image,
    title: artist.name,
  };
}

/**
 * Artists grid: same layout and behavior as Library → Artists tab (query, skeleton, list, navigation).
 */
export default function LibraryArtistsGrid() {
  const router = useRouter();
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });
  const listContentStyle = useMemo(
    () => ({
      paddingBottom: scrollBottomPadding,
    }),
    [scrollBottomPadding]
  );
  const { refreshControl } = useRefreshable({
    queryKeys: ["topArtists", TOP_ARTISTS_LIMIT],
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["topArtists", TOP_ARTISTS_LIMIT],
    queryFn: () => getTopArtists({ limit: TOP_ARTISTS_LIMIT }),
  });

  const artists = data?.data?.results ?? [];
  const artistItems = useMemo(
    () => artists.map(mapArtistToLibraryItem),
    [artists]
  );

  const handleArtistPress = useCallback(
    (item: LibraryItem) => {
      router.push({
        pathname: "/home/top-artists/[id]",
        params: { id: item.id, name: item.title },
      });
    },
    [router]
  );

  const renderArtistItem = useCallback<ListRenderItem<LibraryItem>>(
    ({ item }) => (
      <View style={rowWrapperStyle}>
        <LibraryCard
          id={item.id}
          imageUrl={item.imageUrl}
          title={item.title}
          onPress={() => handleArtistPress(item)}
        />
      </View>
    ),
    [handleArtistPress]
  );

  const keyExtractor = useCallback((item: LibraryItem) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.flex}>
        <LibraryGridSkeleton contentBottomPadding={scrollBottomPadding} />
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ flex: 1, justifyContent: "center" }}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(24),
            alignSelf: "center",
          }}
        >
          <MyText
            fontSize={moderateScale(14)}
            color={themeColors.dark.textMuted}
            textAlign="center"
          >
            Failed to load artists
          </MyText>
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      data={artistItems}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={LIBRARY_GRID_COLUMN_WRAPPER_STYLE}
      contentContainerStyle={listContentStyle}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      renderItem={renderArtistItem}
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
