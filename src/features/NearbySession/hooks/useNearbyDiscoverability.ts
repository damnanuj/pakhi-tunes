import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { appToast } from "src/components/toast/appToastHelpers";
import { updateDiscoverable } from "../services/session.service";
import {
  NEARBY_PROFILE_REDIRECT,
  redirectToSignInForNearby,
} from "../utils/nearbyAuthGate";
import { requestLocationPermission } from "../utils/locationPermission";

export function useNearbyDiscoverability(
  authRedirectPath: string = NEARBY_PROFILE_REDIRECT
) {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);

  const discoverable = Boolean(user?.discoverable);

  const applyDiscoverable = useCallback(
    async (next: boolean) => {
      if (!user) return;
      setIsUpdating(true);
      try {
        const updated = await updateDiscoverable(next);
        setUser(updated);
      } catch {
        appToast.error("Could not update nearby listening setting");
      } finally {
        setIsUpdating(false);
      }
    },
    [setUser, user]
  );

  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (!isAuthenticated) {
        if (checked) {
          redirectToSignInForNearby(router, authRedirectPath);
        }
        return;
      }

      if (!user) return;

      if (checked) {
        setShowPermissionInfo(true);
        return;
      }

      await applyDiscoverable(false);
    },
    [applyDiscoverable, authRedirectPath, isAuthenticated, router, user]
  );

  const handlePermissionConfirm = useCallback(async () => {
    setShowPermissionInfo(false);
    if (!user) return;

    const granted = await requestLocationPermission();
    if (!granted) {
      setShowSettingsPrompt(true);
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateDiscoverable(true);
      setUser(updated);
      appToast.info(
        "Nearby listening is on. Others can find you while you play music."
      );
    } catch {
      appToast.error("Could not enable nearby listening");
    } finally {
      setIsUpdating(false);
    }
  }, [setUser, user]);

  return {
    discoverable,
    isAuthenticated,
    isUpdating,
    handleToggle,
    showPermissionInfo,
    setShowPermissionInfo,
    showSettingsPrompt,
    setShowSettingsPrompt,
    handlePermissionConfirm,
  };
}
