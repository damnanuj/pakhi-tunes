import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  ScrollView,
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
import type { LibraryTabId } from "./LibraryTabs";
import type { TopArtist } from "src/types/topArtists.types";

const TOP_ARTISTS_LIMIT = 50;

const CARD_GAP = scale(12);

export interface LibraryItem {
  id: string;
  imageUrl: string;
  title: string;
}

const RECENT_ITEMS: LibraryItem[] = [
  {
    id: "1",
    title: "Variete Vol 1",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Bhojpuri",
    imageUrl:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Angola",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    title: "Congo Kinshasa",
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    title: "DJ Mix",
    imageUrl:
      "https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    title: "Studio Sessions",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
];

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

const TAB_DATA: Record<Exclude<LibraryTabId, "artists">, LibraryItem[]> = {
  recent: RECENT_ITEMS,
  playlists: PLAYLISTS_ITEMS,
  albums: ALBUMS_ITEMS,
};

function mapArtistToLibraryItem(artist: TopArtist): LibraryItem {
  return {
    id: artist.encrypted_id,
    imageUrl: artist.image,
    title: artist.name,
  };
}

export interface LibraryGridProps {
  activeTab: LibraryTabId;
  onItemPress?: (item: LibraryItem) => void;
}

const columnWrapperStyle = {
  gap: CARD_GAP,
  paddingHorizontal: scale(20),
  marginBottom: verticalScale(12),
} as const;

const rowWrapperStyle = { flex: 1, minWidth: 0 } as const;

export default function LibraryGrid({
  activeTab,
  onItemPress,
}: LibraryGridProps) {
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
    enabled: activeTab === "artists",
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
    if (activeTab === "artists") return RECENT_ITEMS;
    return TAB_DATA[activeTab] ?? RECENT_ITEMS;
  }, [activeTab]);

  if (activeTab === "artists") {
    if (isLoading) {
      return <LibraryGridSkeleton />;
    }

    if (isError) {
      return (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: scale(20), paddingVertical: verticalScale(24), alignSelf: "center" }}>
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
        data={artistItems}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={columnWrapperStyle}
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

  return (
    <FlatList
      data={staticTabItems}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={columnWrapperStyle}
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
