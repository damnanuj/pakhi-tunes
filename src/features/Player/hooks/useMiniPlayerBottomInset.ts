import { usePathname, useSegments } from "expo-router";
import { usePlayerStore } from "../store/playerStore";
import { getMiniPlayerScrollExtraInset } from "../miniPlayerLayout";

/**
 * Returns extra bottom inset (px) for scroll content when the mini player is visible.
 * Matches tab vs stack positioning used by MiniPlayer.
 * For full-screen scroll padding (tab bar + mini player + gap), use `useScrollBottomInset` from `src/hooks`.
 */
export function useMiniPlayerBottomInset(): number {
  const pathname = usePathname();
  const segments = useSegments();
  const hasTrack = usePlayerStore((s) => s.activeTrack !== null);
  if (!hasTrack) return 0;
  if (pathname === "/player") return 0;
  const onTabs = segments[0] === "(tabs)";
  return getMiniPlayerScrollExtraInset(onTabs);
}
