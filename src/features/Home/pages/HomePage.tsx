import { ScrollView, View } from "react-native";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import { useNetwork } from "src/contexts/NetworkContext";
import {
  useConnectionErrorProps,
  useRefreshable,
  useScrollBottomInset,
} from "src/hooks";
import HomeGreeting from "../components/HomeGreeting";
import FeaturedCards from "../components/FeaturedCards";
import NewAlbumsSection from "../components/NewAlbumsSection";
import NewSongsSection from "../components/NewSongsSection";
import TopArtistsSection from "../components/TopArtistsSection";
import NearbyListeningCard from "../components/NearbyListeningCard";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  HOME_QUERY_KEYS,
  useHomePageQueries,
} from "../hooks/useHomePageQueries";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { isOffline, bannerPhase } = useNetwork();
  const {
    hasDisplayableContent,
    isAnyFetching,
    isAnyPending,
    allFailedWithoutData,
    refetchAll,
  } = useHomePageQueries();
  const connectionErrorProps = useConnectionErrorProps({
    isOffline,
    refetch: refetchAll,
    isFetching: isAnyFetching,
  });
  const { refreshControl } = useRefreshable({
    queryKeys: [...HOME_QUERY_KEYS],
  });
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  const isRecoveringFromOffline =
    bannerPhase === "reconnected" || isAnyFetching || isAnyPending;

  const showFallback =
    !hasDisplayableContent &&
    (isOffline || (allFailedWithoutData && !isRecoveringFromOffline));

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      <View style={{ marginBottom: SECTION_GAP }}>
        <HomeGreeting />
      </View>
      {showFallback ? (
        <ConnectionErrorState {...connectionErrorProps} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
          }}
          refreshControl={refreshControl}
        >
          {isAuthenticated ? (
            <View style={{ marginBottom: SECTION_GAP }}>
              <NearbyListeningCard />
            </View>
          ) : null}
          <View style={{ marginBottom: SECTION_GAP }}>
            <FeaturedCards />
          </View>
          <View style={{ marginBottom: SECTION_GAP }}>
            <NewSongsSection />
          </View>
          <View style={{ marginBottom: SECTION_GAP }}>
            <NewAlbumsSection />
          </View>
          <TopArtistsSection />
        </ScrollView>
      )}
    </YStack>
  );
}
