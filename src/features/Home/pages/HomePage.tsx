import { ScrollView, View } from "react-native";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";
import HomeGreeting from "../components/HomeGreeting";
import FeaturedCards from "../components/FeaturedCards";
import NewAlbumsSection from "../components/NewAlbumsSection";
import NewSongsSection from "../components/NewSongsSection";
import TopArtistsSection from "../components/TopArtistsSection";
import NearbyListeningCard from "../components/NearbyListeningCard";
import { useAuth } from "src/features/auth/hooks/useAuth";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { refreshControl } = useRefreshable({
    queryKeys: [
      ["genres"],
      ["topArtists", 10],
      ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "album", "home"],
      ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "song", "home"],
    ],
  });
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(20),
  });

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
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
    </YStack>
  );
}
