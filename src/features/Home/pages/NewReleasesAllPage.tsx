import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import PillTabs, { type PillTabItem } from "src/components/PillTabs";
import { useRefreshable } from "src/hooks";
import { getNewReleases } from "src/services";
import LibraryCard from "src/features/Library/components/LibraryCard";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { formatLanguageLabel } from "src/utils/functions/formatLanguageLabel";
import { usePlayback } from "src/features/Player";
import { useMiniPlayerBottomInset } from "src/features/Player";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import type { ArtistSong } from "src/types/artistSongs.types";
import {
  isNewReleaseAlbum,
  type NewReleaseListItem,
} from "src/types/newReleases.types";
import NewReleasesAllPageSkeleton, {
  SkeletonCard,
} from "../skeletons/NewReleasesAllPageSkeleton";

const LIST_LIMIT = 30;
const DEFAULT_LANGUAGE = "hindi";
const CARD_GAP = scale(12);
const SKELETON_GRID_KEYS = Array.from({ length: 8 }, (_, i) => ({ key: i }));

const columnWrapperStyle = {
  gap: CARD_GAP,
  paddingHorizontal: scale(20),
  marginBottom: verticalScale(12),
} as const;

export default function NewReleasesAllPage() {
  const router = useRouter();
  const { playSong } = usePlayback();
  const miniPlayerInset = useMiniPlayerBottomInset();
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [tabSwitching, setTabSwitching] = useState(false);

  const listBottomPadding = useMemo(
    () => TAB_BAR_HEIGHT + miniPlayerInset,
    [miniPlayerInset]
  );

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ["newReleases", LIST_LIMIT, language],
    queryFn: () =>
      getNewReleases({
        limit: LIST_LIMIT,
        offset: 0,
        language,
      }),
  });

  useEffect(() => {
    const codes = data?.data?.meta?.supportedLanguages;
    if (codes?.length) setSupportedLanguages(codes);
  }, [data?.data?.meta?.supportedLanguages]);

  useEffect(() => {
    if (!supportedLanguages.length) return;
    if (!supportedLanguages.includes(language)) {
      setLanguage(supportedLanguages[0]);
    }
  }, [supportedLanguages, language]);

  useEffect(() => {
    if (tabSwitching && !isFetching) {
      setTabSwitching(false);
    }
  }, [isFetching, tabSwitching]);

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      await refetch();
    },
  });

  const languageTabs: PillTabItem[] = useMemo(() => {
    return supportedLanguages.map((code) => ({
      id: code,
      label: formatLanguageLabel(code),
    }));
  }, [supportedLanguages]);

  const handleTabChange = useCallback((id: string) => {
    if (id !== language) {
      setTabSwitching(true);
      setLanguage(id);
    }
  }, [language]);

  const results = data?.data?.results ?? [];

  const handlePress = useCallback(
    (item: NewReleaseListItem) => {
      if (isNewReleaseAlbum(item)) {
        router.push({
          pathname: "/home/album/[id]",
          params: { id: item.id },
        });
        return;
      }
      void playSong(item as ArtistSong);
    },
    [router, playSong]
  );

  const renderItem: ListRenderItem<NewReleaseListItem> = useCallback(
    ({ item }) => {
      const cover = getSongCoverUrl(item.image, "500x500");
      const title = decodeHtmlEntities(item.name);
      if (isNewReleaseAlbum(item)) {
        return (
          <View style={{ flex: 1, minWidth: 0 }}>
            <LibraryCard
              id={item.id}
              imageUrl={cover}
              title={title}
              subtitle="Album"
              onPress={() => handlePress(item)}
            />
          </View>
        );
      }
      const song = item as ArtistSong;
      const artists = song.artists.primary.map((a) => a.name).join(", ");
      return (
        <View style={{ flex: 1, minWidth: 0 }}>
          <LibraryCard
            id={song.id}
            imageUrl={cover}
            title={title}
            subtitle={artists || "Song"}
            trailingAction="play"
            onPress={() => handlePress(item)}
          />
        </View>
      );
    },
    [handlePress]
  );

  const keyExtractor = useCallback((item: NewReleaseListItem) => {
    return isNewReleaseAlbum(item) ? `album-${item.id}` : `song-${item.id}`;
  }, []);

  const listContentStyle = useMemo(
    () => ({
      paddingTop: verticalScale(8),
      paddingBottom: verticalScale(24) + listBottomPadding,
    }),
    [listBottomPadding]
  );

  const showFullSkeleton =
    isPending && supportedLanguages.length === 0;
  /** After first meta load: switching language shows card skeleton until fetch settles. */
  const showTabsWithGridSkeleton =
    tabSwitching && (isFetching || isPending);

  if (isError) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Releases" />
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <YStack px={scale(20)} py={verticalScale(24)} style={{ alignSelf: "center" }}>
            <MyText
              fontSize={moderateScale(14)}
              color={themeColors.dark.textMuted}
              textAlign="center"
            >
              Failed to load new releases
            </MyText>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  if (showFullSkeleton) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Releases" />
        <NewReleasesAllPageSkeleton />
      </YStack>
    );
  }

  if (showTabsWithGridSkeleton) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Releases" />
        <FlatList
          data={SKELETON_GRID_KEYS}
          numColumns={2}
          keyExtractor={(item) => String(item.key)}
          ListHeaderComponent={
            <YStack mb={verticalScale(12)}>
              <PillTabs
                tabs={languageTabs}
                activeId={language}
                onTabChange={handleTabChange}
              />
            </YStack>
          }
          renderItem={() => (
            <View style={{ flex: 1, minWidth: 0, marginBottom: verticalScale(12) }}>
              <SkeletonCard />
            </View>
          )}
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={listContentStyle}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        />
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title="New Releases" />
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={listContentStyle}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={
          <YStack mb={verticalScale(12)}>
            <PillTabs
              tabs={languageTabs}
              activeId={language}
              onTabChange={handleTabChange}
            />
          </YStack>
        }
        ListEmptyComponent={
          <YStack px={scale(20)} py={verticalScale(24)} style={{ alignItems: "center" }}>
            <MyText fontSize={moderateScale(14)} color={themeColors.dark.textMuted}>
              No releases yet
            </MyText>
          </YStack>
        }
      />
    </YStack>
  );
}
