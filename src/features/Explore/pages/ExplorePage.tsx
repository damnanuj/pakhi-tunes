import { useEffect, useState } from "react";
import { YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import AppHeader from "src/components/AppHeader";
import SearchBar from "src/features/Home/components/SearchBar";
import ExploreSearchResults from "../components/ExploreSearchResults";
import ExploreNewReleasesList from "../components/ExploreNewReleasesList";
import OfflineFallback from "src/features/Downloads/components/OfflineFallback";
import { verticalScale } from "src/utils/functions/dimensions";
import { useDebouncedValue } from "src/hooks";
import { useNetwork } from "src/contexts/NetworkContext";
import { useRecentSearchStore } from "../store/recentSearchStore";

const SEARCH_DEBOUNCE_MS = 350;
const HISTORY_SAVE_DEBOUNCE_MS = 1500;

export default function ExplorePage() {
  const { isOffline } = useNetwork();
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const historyTerm = useDebouncedValue(trimmedQuery, HISTORY_SAVE_DEBOUNCE_MS);
  const isSearchActive = trimmedQuery.length > 0;

  const addSearch = useRecentSearchStore((state) => state.addSearch);

  useEffect(() => {
    if (historyTerm.length > 0) {
      addSearch(historyTerm);
    }
  }, [historyTerm, addSearch]);

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
        {isOffline && isSearchActive ? (
          <OfflineFallback
            subtitle="Search needs an internet connection. Downloaded songs are in your Library."
          />
        ) : isSearchActive ? (
          <ExploreSearchResults
            query={trimmedQuery}
            debouncedQuery={debouncedQuery}
          />
        ) : (
          <ExploreNewReleasesList onSelectRecentSearch={setQuery} />
        )}
      </YStack>
    </YStack>
  );
}
