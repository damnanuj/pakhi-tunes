import { useState } from "react";
import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import SearchBar from "src/features/Home/components/SearchBar";
import ExploreSearchResults from "../components/ExploreSearchResults";
import ExploreNewReleasesList from "../components/ExploreNewReleasesList";
import { verticalScale } from "src/utils/functions/dimensions";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const isSearchActive = query.trim().length > 0;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <AppHeader />
      <SearchBar
        mode="search"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      <YStack flex={1} mt={verticalScale(12)}>
        {isSearchActive ? (
          <ExploreSearchResults query={query} />
        ) : (
          <ExploreNewReleasesList />
        )}
      </YStack>
    </YStack>
  );
}
