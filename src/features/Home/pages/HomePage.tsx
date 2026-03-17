import { ScrollView, View } from "react-native";
import { XStack, YStack } from "tamagui";
import { Bell, Settings } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import CircularButton from "src/components/CircularButton";
import ScreenHeader from "src/components/ScreenHeader";
import SearchBar from "../components/SearchBar";
import FeaturedCards from "../components/FeaturedCards";
import TopMusicsSection from "../components/TopMusicsSection";
import TopArtistsSection from "../components/TopArtistsSection";
import TopAlbumsSection from "../components/TopAlbumsSection";

const SECTION_GAP = verticalScale(20);

export default function HomePage() {
  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader
        leftContent={
          <MyText
            fontSize={moderateScale(16)}
            weight="600"
            color={themeColors.dark.onSurface}
          >
            Pakhi Tunes
          </MyText>
        }
        rightContent={
          <XStack gap={scale(10)} items="center">
            <CircularButton>
              <YStack items="center" justify="center">
                <MyText
                  fontSize={moderateScale(8)}
                  color={themeColors.dark.accent}
                >
                  FREE
                </MyText>
                <MyText
                  fontSize={moderateScale(8)}
                  color={themeColors.dark.accent}
                >
                  MUSIC
                </MyText>
              </YStack>
            </CircularButton>
            <CircularButton>
              <Bell
                size={moderateScale(20)}
                color={themeColors.dark.onSurface}
              />
            </CircularButton>
            <CircularButton>
              <Settings
                size={moderateScale(20)}
                color={themeColors.dark.onSurface}
              />
            </CircularButton>
          </XStack>
        }
      />
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
