import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useAuthStore } from "src/features/auth/store/authStore";
import { FAVORITES_QUERY_KEY } from "../queries/favoritesQuery";
import { syncLocalFavoritesToServer } from "../services/syncLocalFavorites.service";

type FavoritesSyncProviderProps = {
  children: React.ReactNode;
};

export default function FavoritesSyncProvider({
  children,
}: FavoritesSyncProviderProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isAuthenticated) return;

    void syncLocalFavoritesToServer()
      .then(() =>
        queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      )
      .catch((error) => {
        console.warn("Favorites sync failed", error);
      });
  }, [isAuthenticated, isHydrated, queryClient]);

  return children;
}
