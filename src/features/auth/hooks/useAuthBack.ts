import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { sanitizeRedirectPath } from "../utils/validation";

export function useAuthBack() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    const fallback = sanitizeRedirectPath(redirect);
    const isAuthRoute = fallback === "/auth";
    router.replace(isAuthRoute ? "/(tabs)/home" : fallback);
  }, [router, redirect]);
}
