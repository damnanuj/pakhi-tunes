import { useMemo } from "react";
import { usePathname, useSegments } from "expo-router";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import {
  getMiniPlayerCardHeight,
  MINI_PLAYER_GAP_ABOVE_TAB,
  MINI_PLAYER_MARGIN_BOTTOM,
} from "src/features/Player/miniPlayerLayout";
import { verticalScale } from "src/utils/functions/dimensions";

const TOAST_GAP_ABOVE_MINI = verticalScale(8);

export function useToastBottomOffset(): number {
  const pathname = usePathname();
  const segments = useSegments();
  const hasTrack = usePlayerStore((s) => s.activeTrack !== null);

  return useMemo(() => {
    const onTabs = segments[0] === "(tabs)";
    const onFullPlayer = pathname === "/player";

    if (hasTrack && !onFullPlayer) {
      const miniBottom = onTabs
        ? TAB_BAR_HEIGHT + MINI_PLAYER_GAP_ABOVE_TAB
        : MINI_PLAYER_MARGIN_BOTTOM;
      return miniBottom + getMiniPlayerCardHeight() + TOAST_GAP_ABOVE_MINI;
    }

    return onTabs ? TAB_BAR_HEIGHT + verticalScale(12) : verticalScale(16);
  }, [hasTrack, pathname, segments]);
}
