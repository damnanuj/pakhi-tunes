import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

const guidelineBaseWidth = 414;
const guidelineBaseHeight = 844;

const widthRatio = SCREEN_WIDTH / guidelineBaseWidth;
const heightRatio = SCREEN_HEIGHT / guidelineBaseHeight;

/**
 * Linear horizontal scaling — for widths, horizontal padding, horizontal margins, gaps
 *
 * Usage: width, paddingHorizontal, marginLeft, marginRight, gap (horizontal lists)
 */
export const scale = (size: number): number => Math.round(size * widthRatio);

/**
 * Linear vertical scaling — for heights, vertical padding, vertical margins
 *
 * Usage: height, paddingVertical, marginTop, marginBottom, gap (vertical lists)
 */
export const verticalScale = (size: number): number =>
  Math.round(size * heightRatio);

/**
 * Dampened scaling — grows/shrinks at a controlled rate instead of linearly.
 * Prevents UI from becoming oversized on tablets or too tiny on small phones.
 *
 * @param factor 0 = no scaling, 1 = full linear scaling. Default 0.5
 *
 * Usage: fontSize, iconSize, borderRadius, borderWidth,
 *        avatar/thumbnail dimensions, button heights, fixed-size components
 */
export const moderateScale = (size: number, factor = 0.5): number =>
  Math.round(size + (scale(size) - size) * factor);

/**
 * Dampened vertical scaling — same as moderateScale but based on screen height.
 *
 * Usage: fixed component heights that need gentle vertical adaptation
 */
export const moderateVerticalScale = (size: number, factor = 0.5): number =>
  Math.round(size + (verticalScale(size) - size) * factor);

export { SCREEN_WIDTH, SCREEN_HEIGHT };
