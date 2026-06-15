import type { ViewStyle } from "react-native";
import { moderateScale } from "src/utils/functions/dimensions";

export const playerRippleLight = {
  color: "rgba(255,255,255,0.12)",
  borderless: true,
} as const;

export function ghostControlStyle(pressed: boolean): ViewStyle {
  return {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pressed
      ? "rgba(255,255,255,0.1)"
      : "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: pressed ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
  };
}
