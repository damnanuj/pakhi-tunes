import { ScrollView, StyleSheet, View } from "react-native";
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
import ListenTogetherCard from "../components/ListenTogetherCard";
import {
  HOME_QUERY_KEYS,
  useHomePageQueries,
} from "../hooks/useHomePageQueries";

const SECTION_GAP = verticalScale(20);

function HomeSections() {
  return (
    <>
      <View style={{ marginBottom: SECTION_GAP }}>
        <NearbyListeningCard />
      </View>
      <View style={{ marginBottom: SECTION_GAP }}>
        <ListenTogetherCard />
      </View>
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
    </>
  );
}

export default function HomePage() {
  const { isOffline, bannerPhase } = useNetwork();
  const {
    hasDisplayableContent,
    isAnyFetching,
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

  const isRecoveringFromOffline = bannerPhase === "reconnected";

  const showFallback =
    !hasDisplayableContent &&
    (isOffline || (allFailedWithoutData && !isRecoveringFromOffline));

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      <View style={{ marginBottom: SECTION_GAP }}>
        <HomeGreeting />
      </View>
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={!showFallback}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: scrollBottomPadding,
          }}
          refreshControl={showFallback ? undefined : refreshControl}
        >
          {showFallback ? null : (
            <HomeSections />
          )}
        </ScrollView>
        {showFallback ? (
          <View style={styles.errorOverlay}>
            <ConnectionErrorState {...connectionErrorProps} />
          </View>
        ) : null}
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: themeColors.dark.background,
  },
});
