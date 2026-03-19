import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import SearchBar from "src/features/Home/components/SearchBar";

export default function ExplorePage() {
  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      <SearchBar />
      {/* Search content goes here */}
    </YStack>
  );
}
