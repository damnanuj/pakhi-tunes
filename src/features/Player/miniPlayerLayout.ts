import { moderateScale, scale } from "src/utils/functions/dimensions";

/** Gap between tab bar top and mini player bottom — must match MiniPlayer */
export const MINI_PLAYER_GAP_ABOVE_TAB = scale(6);
/** Stack routes: mini offset from screen bottom — must match MiniPlayer */
export const MINI_PLAYER_MARGIN_BOTTOM = scale(10);

export const MINI_PLAYER_RING = moderateScale(45);
const CARD_PADDING_V = scale(10) * 2;
const TIME_ROW_MARGIN_TOP = scale(4);

/**
 * Approximate mini player card height (tallest of ring or text stack; artwork is square to that height).
 * Used so scroll padding matches the overlay.
 */
export function getMiniPlayerCardHeight(): number {
  const title = moderateScale(14);
  const artist = moderateScale(12);
  const timeRow = moderateScale(11);
  const textStack = title + artist + timeRow + TIME_ROW_MARGIN_TOP + scale(4);
  const inner = Math.max(MINI_PLAYER_RING, textStack);
  return inner + CARD_PADDING_V;
}

/**
 * Extra `paddingBottom` / `contentInset` for scroll views so the last items sit above the mini player.
 */
export function getMiniPlayerScrollExtraInset(onTabs: boolean): number {
  const h = getMiniPlayerCardHeight();
  return onTabs ? MINI_PLAYER_GAP_ABOVE_TAB + h : MINI_PLAYER_MARGIN_BOTTOM + h;
}
