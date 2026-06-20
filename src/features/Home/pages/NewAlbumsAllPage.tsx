import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
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
import ConnectionErrorState from "src/components/ConnectionErrorState";
import ScreenHeader from "src/components/ScreenHeader";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import PillTabs, { type PillTabItem } from "src/components/PillTabs";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import LibraryCard from "src/features/Library/components/LibraryCard";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { formatLanguageLabel } from "src/utils/functions/formatLanguageLabel";
import type { NewReleaseAlbumItem } from "src/types/newReleases.types";
import NewReleasesAllPageSkeleton, {
  SkeletonCard,
} from "../skeletons/NewReleasesAllPageSkeleton";
import { NEW_RELEASES_DEFAULT_LANGUAGE } from "src/utils/constants/newReleases";
import { getNewReleasesAllAlbumsQueryOptions } from "../queries/newReleasesQuery";

const CARD_GAP = scale(12);
const SKELETON_GRID_KEYS = Array.from({ length: 8 }, (_, i) => ({ key: i }));

const columnWrapperStyle = {
  gap: CARD_GAP,
  paddingHorizontal: scale(20),
  marginBottom: verticalScale(12),
} as const;

export default function NewAlbumsAllPage() {
  const router = useRouter();
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });
  const [language, setLanguage] = useState(NEW_RELEASES_DEFAULT_LANGUAGE);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [tabSwitching, setTabSwitching] = useState(false);

  const { data, isPending, isError, error, isFetching, refetch } = useQuery(
    getNewReleasesAllAlbumsQueryOptions(language)
  );

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

  const albums = (data?.data?.results ?? []) as NewReleaseAlbumItem[];

  const handlePress = useCallback(
    (item: NewReleaseAlbumItem) => {
      router.push({
        pathname: "/home/album/[id]",
        params: { id: item.id },
      });
    },
    [router]
  );

  const renderItem: ListRenderItem<NewReleaseAlbumItem> = useCallback(
    ({ item }) => {
      const cover = getSongCoverUrl(item.image, "500x500");
      const title = decodeHtmlEntities(item.name);

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
    },
    [handlePress]
  );

  const keyExtractor = useCallback(
    (item: NewReleaseAlbumItem) => `album-${item.id}`,
    []
  );

  const listHeader = useMemo(
    () => (
      <YStack mb={verticalScale(12)}>
        <PillTabs
          tabs={languageTabs}
          activeId={language}
          onTabChange={handleTabChange}
        />
      </YStack>
    ),
    [languageTabs, language, handleTabChange]
  );

  const renderSkeletonGridItem = useCallback(
    () => (
      <View style={{ flex: 1, minWidth: 0, marginBottom: verticalScale(12) }}>
        <SkeletonCard />
      </View>
    ),
    []
  );

  const listContentStyle = useMemo(
    () => ({
      paddingTop: verticalScale(8),
      paddingBottom: scrollBottomPadding,
    }),
    [scrollBottomPadding]
  );

  const showFullSkeleton = isPending && supportedLanguages.length === 0;
  const showTabsWithGridSkeleton = tabSwitching && (isFetching || isPending);

  if (isError) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Albums" />
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </YStack>
    );
  }

  if (showFullSkeleton) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Albums" />
        <NewReleasesAllPageSkeleton />
      </YStack>
    );
  }

  if (showTabsWithGridSkeleton) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Albums" />
        <FlatList
          data={SKELETON_GRID_KEYS}
          numColumns={2}
          keyExtractor={(item) => String(item.key)}
          ListHeaderComponent={listHeader}
          renderItem={renderSkeletonGridItem}
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={listContentStyle}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
        />
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title="New Albums" />
      <FlatList
        data={albums}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={listContentStyle}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
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
              No albums yet
            </MyText>
          </YStack>
        }
      />
    </YStack>
  );
}
