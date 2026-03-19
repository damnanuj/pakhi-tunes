import { useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import themeColors from "src/utils/theme/colors";

type UseRefreshableOptions =
  | {
      /** React Query key(s) to refetch. Pass a single key or array of keys. */
      queryKeys: QueryKey | QueryKey[];
    }
  | {
      /** Custom async refresh handler (e.g. refetch from useQuery). */
      onRefresh: () => Promise<void>;
    };

/**
 * Reusable pull-to-refresh hook for any scrollable page.
 * Use with ScrollView, FlatList, etc. via the refreshControl prop.
 *
 * @example With React Query keys:
 *   const { refreshControl } = useRefreshable({ queryKeys: ["topArtists", 50] });
 *   <FlatList refreshControl={refreshControl} ... />
 *
 * @example With custom handler:
 *   const { refetch } = useQuery(...);
 *   const { refreshControl } = useRefreshable({ onRefresh: refetch });
 *   <ScrollView refreshControl={refreshControl} ... />
 */
export function useRefreshable(options: UseRefreshableOptions) {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if ("queryKeys" in options) {
        const raw = options.queryKeys;
        const keys: QueryKey[] = Array.isArray(raw)
          ? (Array.isArray(raw[0]) ? raw : [raw])
          : [raw];
        await Promise.all(
          keys.map((key) => queryClient.refetchQueries({ queryKey: key }))
        );
      } else {
        await options.onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, [options, queryClient]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={themeColors.dark.accent}
    />
  );

  return { refreshing, onRefresh, refreshControl };
}
