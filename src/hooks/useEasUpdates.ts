import { useEffect } from "react";
import * as Updates from "expo-updates";

function shouldCheckForEasUpdates() {
  if (__DEV__) return false;
  if (!Updates.isEnabled) return false;
  if (Updates.channel === "development") return false;
  return true;
}

export function useEasUpdates() {
  useEffect(() => {
    if (!shouldCheckForEasUpdates()) return;

    let cancelled = false;

    async function checkAndApplyUpdate() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (cancelled || !result.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (!cancelled) {
          await Updates.reloadAsync();
        }
      } catch {
        // Continue with the embedded bundle if OTA check fails.
      }
    }

    void checkAndApplyUpdate();

    return () => {
      cancelled = true;
    };
  }, []);
}
