import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = "explore-recent-searches";

type RecentSearchState = {
  searches: string[];
  addSearch: (term: string) => void;
  removeSearch: (term: string) => void;
  clearAll: () => void;
};

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set, get) => ({
      searches: [],
      addSearch: (term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        const filtered = get().searches.filter(
          (s) => s.toLowerCase() !== lower
        );
        set({
          searches: [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES),
        });
      },
      removeSearch: (term) => {
        const lower = term.toLowerCase();
        set({
          searches: get().searches.filter((s) => s.toLowerCase() !== lower),
        });
      },
      clearAll: () => set({ searches: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ searches: state.searches }),
    }
  )
);

export const useRecentSearches = () =>
  useRecentSearchStore((state) => state.searches);

export const useRecentSearchActions = () => {
  const addSearch = useRecentSearchStore((state) => state.addSearch);
  const removeSearch = useRecentSearchStore((state) => state.removeSearch);
  const clearAll = useRecentSearchStore((state) => state.clearAll);
  return { addSearch, removeSearch, clearAll };
};
