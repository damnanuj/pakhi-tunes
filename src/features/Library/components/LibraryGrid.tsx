import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  View,
} from "react-native";
import { useScrollBottomInset } from "src/hooks";
import DownloadsList from "src/features/Downloads/components/DownloadsList";
import LibraryRecentList from "src/features/history/components/LibraryRecentList";
import LibraryCard from "./LibraryCard";
import LibraryArtistsGrid from "./LibraryArtistsGrid";
import { LIBRARY_GRID_COLUMN_WRAPPER_STYLE } from "../libraryGridLayout";
import type { LibraryTabId } from "./LibraryTabs";
import type { LibraryItem } from "../types/libraryItem";

export type { LibraryItem } from "../types/libraryItem";

const PLAYLISTS_ITEMS: LibraryItem[] = [
  {
    id: "p1",
    title: "Chill Vibes",
    imageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
  {
    id: "p2",
    title: "Workout Mix",
    imageUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
  },
  {
    id: "p3",
    title: "Focus Mode",
    imageUrl:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
  },
  {
    id: "p4",
    title: "Road Trip",
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
  },
];

const ALBUMS_ITEMS: LibraryItem[] = [
  {
    id: "al1",
    title: "Midnights",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
  },
  {
    id: "al2",
    title: "Dawn FM",
    imageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
  {
    id: "al3",
    title: "Future Nostalgia",
    imageUrl:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
  },
  {
    id: "al4",
    title: "30",
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
  },
];

const TAB_DATA: Record<
  Exclude<LibraryTabId, "artists" | "downloads" | "recent">,
  LibraryItem[]
> = {
  playlists: PLAYLISTS_ITEMS,
  albums: ALBUMS_ITEMS,
};

export interface LibraryGridProps {
  activeTab: LibraryTabId;
  onItemPress?: (item: LibraryItem) => void;
}

const rowWrapperStyle = { flex: 1, minWidth: 0 } as const;

export default function LibraryGrid({
  activeTab,
  onItemPress,
}: LibraryGridProps) {
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });
  const listContentStyle = useMemo(
    () => ({
      paddingBottom: scrollBottomPadding,
    }),
    [scrollBottomPadding]
  );

  const renderLibraryTabItem = useCallback<ListRenderItem<LibraryItem>>(
    ({ item }) => (
      <View style={rowWrapperStyle}>
        <LibraryCard
          id={item.id}
          imageUrl={item.imageUrl}
          title={item.title}
          onPress={() => onItemPress?.(item)}
        />
      </View>
    ),
    [onItemPress]
  );

  const keyExtractor = useCallback((item: LibraryItem) => item.id, []);

  const staticTabItems = useMemo(() => {
    return TAB_DATA[activeTab as keyof typeof TAB_DATA] ?? PLAYLISTS_ITEMS;
  }, [activeTab]);

  if (activeTab === "artists") {
    return <LibraryArtistsGrid />;
  }

  if (activeTab === "downloads") {
    return <DownloadsList />;
  }

  if (activeTab === "recent") {
    return <LibraryRecentList />;
  }

  return (
    <FlatList
      style={styles.flex}
      data={staticTabItems}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={LIBRARY_GRID_COLUMN_WRAPPER_STYLE}
      contentContainerStyle={listContentStyle}
      showsVerticalScrollIndicator={false}
      renderItem={renderLibraryTabItem}
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
