import { useMemo } from "react";
import { verticalScale } from "src/utils/functions/dimensions";
import { TAB_BAR_HEIGHT } from "src/constants/tabBar";
import { useMiniPlayerBottomInset } from "src/features/Player";

export type UseScrollBottomInsetOptions = {
  /**
   * Include bottom tab bar height. Use for screens **pushed onto a stack inside a tab**
   * (e.g. `/home/top-artists`, `/home/new-releases`) where the bar sits over the scroll area.
   * Omit or `false` for root tab screens whose content already sits above the bar.
   */
  includeTabBar?: boolean;
  /**
   * Extra space below the last row (scaled). Defaults to `verticalScale(24)`.
   * Pass `0` when the list should only clear chrome (tab bar + mini player) with no gap.
   */
  extra?: number;
};

const DEFAULT_EXTRA = () => verticalScale(24);

/**
 * Total bottom inset for scrollable content: optional tab bar + mini player clearance + extra gap.
 * Prefer this over composing `TAB_BAR_HEIGHT` + `useMiniPlayerBottomInset` on each screen.
 */
export function useScrollBottomInset(
  options?: UseScrollBottomInsetOptions
): number {
  const includeTabBar = options?.includeTabBar ?? false;
  const extra =
    options?.extra !== undefined ? options.extra : DEFAULT_EXTRA();

  const miniPlayerInset = useMiniPlayerBottomInset();

  return useMemo(() => {
    const tabBar = includeTabBar ? TAB_BAR_HEIGHT : 0;
    return extra + tabBar + miniPlayerInset;
  }, [extra, includeTabBar, miniPlayerInset]);
}
