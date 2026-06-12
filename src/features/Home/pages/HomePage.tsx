import { ScrollView, View } from "react-native";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import { useRefreshable, useScrollBottomInset } from "src/hooks";
import SearchBar from "../components/SearchBar";
import FeaturedCards from "../components/FeaturedCards";
import NewReleasesSection from "../components/NewReleasesSection";
import TopArtistsSection from "../components/TopArtistsSection";
import TopAlbumsSection from "../components/TopAlbumsSection";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  const { refreshControl } = useRefreshable({
    queryKeys: [["topArtists", 10], ["newReleases", 12, "all"]],
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
        <TopAlbumsSection />
      </ScrollView>
    </YStack>
  );
}
