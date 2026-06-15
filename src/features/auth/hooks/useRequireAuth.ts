import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";

export function useRequireAuth(redirectPath?: string) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  const requireAuth = useCallback(
    (onAuthenticated?: () => void) => {
      if (!isHydrated) return false;
      if (isAuthenticated) {
        onAuthenticated?.();
        return true;
      }
      router.push({
        pathname: "/auth",
        params: redirectPath
          ? { mode: "signin", redirect: redirectPath }
          : { mode: "signin" },
      });
      return false;
    },
    [isAuthenticated, isHydrated, redirectPath, router]
  );

  return { requireAuth, isAuthenticated, isHydrated };
}
