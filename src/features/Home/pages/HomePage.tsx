import { ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import { useNetwork } from "src/contexts/NetworkContext";
import OfflineFallback from "src/features/Downloads/components/OfflineFallback";
import { getNewReleases } from "src/services";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";
import SearchBar from "../components/SearchBar";
import FeaturedCards from "../components/FeaturedCards";
import NewReleasesSection from "../components/NewReleasesSection";
import TopArtistsSection from "../components/TopArtistsSection";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  const { isOffline } = useNetwork();
  const { refreshControl } = useRefreshable({
    queryKeys: [["topArtists", 10], ["newReleases", 12, "all"]],
  });
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });
  const { data: newReleasesData, isLoading: isNewReleasesLoading } = useQuery({
    queryKey: ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "home"],
    queryFn: () =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
      }),
    enabled: !isOffline,
  });

  const hasCachedHomeData = Boolean(newReleasesData?.data?.results?.length);
  const showOfflineFallback =
    isOffline && !hasCachedHomeData && !isNewReleasesLoading;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      {showOfflineFallback ? (
        <OfflineFallback />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          refreshControl={refreshControl}
        >
          <View style={{ marginBottom: SECTION_GAP }}>
            <SearchBar mode="navigate" />
          </View>
          <View style={{ marginBottom: SECTION_GAP }}>
            <FeaturedCards />
          </View>
          <View style={{ marginBottom: SECTION_GAP }}>
            <NewReleasesSection />
          </View>
          <View style={{ marginBottom: SECTION_GAP }}>
            <TopArtistsSection />
          </View>
          {/* <TopAlbumsSection /> */}
        </ScrollView>
      )}
    </YStack>
  );
}
