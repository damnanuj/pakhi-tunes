import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem } from "react-native";
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
import PillTabs, { type PillTabItem } from "src/components/PillTabs";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getNewReleaseSongs } from "src/types/newReleases.types";
import { formatLanguageLabel } from "src/utils/functions/formatLanguageLabel";
import { NEW_RELEASES_DEFAULT_LANGUAGE } from "src/utils/constants/newReleases";
import { getNewReleasesAllSongsQueryOptions } from "../queries/newReleasesQuery";
import GenreSongsPageSkeleton from "src/features/Genres/skeletons/GenreSongsPageSkeleton";

export default function NewSongsAllPage() {
  const { isOffline } = useNetwork();
  const scrollBottomPadding = useScrollBottomInset({ includeTabBar: true });
  const [language, setLanguage] = useState(NEW_RELEASES_DEFAULT_LANGUAGE);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [tabSwitching, setTabSwitching] = useState(false);

  const { data, isPending, isError, error, isFetching, refetch } = useQuery(
    getNewReleasesAllSongsQueryOptions(language)
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

  const songs = useMemo(
    () => getNewReleaseSongs(data?.data?.results ?? []),
    [data?.data?.results]
  );

  const queueSource = useMemo(
    () => ({
      type: "newReleases" as const,
      scope: "all" as const,
      language,
    }),
    [language]
  );

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
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

  const showFullSkeleton = isPending && supportedLanguages.length === 0;
  const showTabsWithListSkeleton =
    tabSwitching && (isFetching || isPending);

  if (isError && songs.length === 0) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Songs" />
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

  if (showFullSkeleton || showTabsWithListSkeleton) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title="New Songs" />
        <GenreSongsPageSkeleton />
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title="New Songs" />
      <QueueProvider songs={songs} source={queueSource}>
        <FlatList
          data={songs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          refreshControl={refreshControl}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
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
                No songs yet
              </MyText>
            </YStack>
          }
        />
      </QueueProvider>
    </YStack>
  );
}
