import { moderateScale, verticalScale } from "src/utils/functions/dimensions";

/** Fixed row height: py(12) + artwork(56) + py(12). */
export const SONG_LIST_ITEM_HEIGHT =
  verticalScale(12) * 2 + moderateScale(56);

export function getSongListItemLayout(
  _data: unknown,
  index: number
): { length: number; offset: number; index: number } {
  return {
    length: SONG_LIST_ITEM_HEIGHT,
    offset: SONG_LIST_ITEM_HEIGHT * index,
    index,
  };
}
