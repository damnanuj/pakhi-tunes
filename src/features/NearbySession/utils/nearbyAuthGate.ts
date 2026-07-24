import { InteractionManager } from "react-native";
import type { Router } from "expo-router";
import { appToast } from "src/components/toast/appToastHelpers";

export const NEARBY_HOME_REDIRECT = "/(tabs)/home/nearby";
export const NEARBY_PROFILE_REDIRECT = "/(tabs)/profile";

export function redirectToSignInForNearby(
  router: Router,
  redirectPath: string
) {
  router.push({
    pathname: "/auth",
    params: { mode: "signin", redirect: redirectPath },
  });

  InteractionManager.runAfterInteractions(() => {
    appToast.signInRequired(undefined, 4500);
  });
}
