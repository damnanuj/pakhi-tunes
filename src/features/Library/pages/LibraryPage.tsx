import { useState } from "react";
import { View } from "react-native";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
// import SearchBar from "src/features/Home/components/SearchBar";
import LibraryTabs, { type LibraryTabId } from "../components/LibraryTabs";
import LibraryGrid from "../components/LibraryGrid";

const SECTION_GAP = verticalScale(20);

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTabId>("recent");

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      {/* <View style={{ marginBottom: SECTION_GAP, width: "100%" }}>
        <SearchBar mode="navigate" />
      </View> */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
      <YStack flex={1}>
        <LibraryGrid activeTab={activeTab} />
      </YStack>
    </YStack>
  );
}
