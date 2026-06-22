import { useCallback } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import LibraryTabs, { type LibraryTabId } from "../components/LibraryTabs";
import LibraryGrid from "../components/LibraryGrid";
import { isLibraryTabId } from "../utils/navigateToLibraryTab";

const SECTION_GAP = verticalScale(20);

export default function LibraryPage() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab: LibraryTabId = isLibraryTabId(tab) ? tab : "recent";

  const handleTabChange = useCallback(
    (next: LibraryTabId) => {
      router.setParams({ tab: next });
    },
    [router]
  );

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      <View style={{ marginBottom: SECTION_GAP }}>
        <LibraryTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
      <YStack flex={1}>
        <LibraryGrid activeTab={activeTab} />
      </YStack>
    </YStack>
  );
}
