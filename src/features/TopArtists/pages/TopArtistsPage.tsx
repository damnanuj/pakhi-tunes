import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import LibraryArtistsGrid from "src/features/Library/components/LibraryArtistsGrid";

export default function TopArtistsPage() {
  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Top Artists" showBack />
      <YStack flex={1}>
        <LibraryArtistsGrid />
      </YStack>
    </YStack>
  );
}
