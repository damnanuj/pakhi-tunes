import { ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { getNewReleases } from "src/services";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";
import HomeGreeting from "../components/HomeGreeting";
import FeaturedCards from "../components/FeaturedCards";
import NewReleasesSection from "../components/NewReleasesSection";
import TopArtistsSection from "../components/TopArtistsSection";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  const { isOffline } = useNetwork();
  const { refreshControl } = useRefreshable({
    queryKeys: [["genres"], ["topArtists", 10], ["newReleases", 12, "all"]],
  });
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });
  const {
    data: newReleasesData,
    isLoading: isNewReleasesLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "home"],
    queryFn: () =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
      }),
    enabled: !isOffline,
  });

  const hasCachedHomeData = Boolean(newReleasesData?.data?.results?.length);
  const showConnectionError =
    !hasCachedHomeData &&
    !isNewReleasesLoading &&
    (isOffline || isError);

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      {showConnectionError ? (
        <ConnectionErrorState
          variant={
            isNetworkRelatedError(error, isOffline) ? "offline" : "error"
          }
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          refreshControl={refreshControl}
        >
          <View style={{ marginBottom: SECTION_GAP }}>
            <HomeGreeting />
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
