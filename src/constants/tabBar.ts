import { moderateVerticalScale } from "src/utils/functions/dimensions";

/** Must match BottomTabBar container height */
export const TAB_BAR_HEIGHT = moderateVerticalScale(80);

/**
 * Tab bar must stack above the mini player so dismiss swipe slides the bar
 * behind the tabs instead of covering them.
 */
export const TAB_BAR_Z_INDEX = 999;
export const MINI_PLAYER_Z_INDEX = 998;
