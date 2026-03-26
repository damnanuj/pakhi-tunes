import { scale, verticalScale, SCREEN_WIDTH } from "src/utils/functions/dimensions";

export const CARD_GAP = scale(12);

const HORIZONTAL_PADDING = scale(20);

/**
 * Shared `FlatList` `columnWrapperStyle` for 2-column library grids (Artists, albums, etc.).
 * Must stay in sync with `LibraryCard` + `LibraryArtistsGrid`.
 */
export const LIBRARY_GRID_COLUMN_WRAPPER_STYLE = {
  gap: CARD_GAP,
  paddingHorizontal: HORIZONTAL_PADDING,
  marginBottom: verticalScale(12),
} as const;

/** Per-cell wrapper — no extra vertical margin; row gap comes from `columnWrapperStyle`. */
export const LIBRARY_ROW_WRAPPER_STYLE = {
  flex: 1,
  minWidth: 0,
} as const;

/** Width of one column (matches `flex: 1` cells under `columnWrapperStyle`). */
export function getLibraryGridCardColumnWidth(): number {
  return (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
}
