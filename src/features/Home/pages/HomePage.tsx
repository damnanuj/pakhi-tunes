import { ScrollView, View } from "react-native";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import HomeHeader from "../components/HomeHeader";
import SearchBar from "../components/SearchBar";
import FeaturedCards from "../components/FeaturedCards";
import TopMusicsSection from "../components/TopMusicsSection";
import TopArtistsSection from "../components/TopArtistsSection";
import TopAlbumsSection from "../components/TopAlbumsSection";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <HomeHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
      >
        <View style={{ marginBottom: SECTION_GAP }}>
          <SearchBar />
        </View>
        <View style={{ marginBottom: SECTION_GAP }}>
          <FeaturedCards />
        </View>
        <View style={{ marginBottom: SECTION_GAP }}>
          <TopMusicsSection />
        </View>
        <View style={{ marginBottom: SECTION_GAP }}>
          <TopArtistsSection />
        </View>
        <TopAlbumsSection />
      </ScrollView>
    </YStack>
  );
}
