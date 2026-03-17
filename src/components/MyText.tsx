import React from "react";
import { Text, TextProps } from "tamagui";

const FONT_WEIGHT_MAP: Record<string, string> = {
  "100": "MPLUSRounded1c_100Thin",
  thin: "MPLUSRounded1c_100Thin",
  "300": "MPLUSRounded1c_300Light",
  light: "MPLUSRounded1c_300Light",
  "400": "MPlusRounded400",
  normal: "MPlusRounded400",
  "500": "MPlusRounded500",
  medium: "MPlusRounded500",
  "600": "MPlusRounded700",
  semibold: "MPlusRounded700",
  "700": "MPlusRounded700",
  bold: "MPlusRounded700",
  "800": "MPlusRounded800",
  extrabold: "MPlusRounded800",
  "900": "MPlusRounded900",
  black: "MPlusRounded900",
};

interface MyTextProps extends TextProps {
  /** Font weight: "100" | "300" | "400" | "500" | "600" | "700" | "800" | "900" or "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black" */
  weight?: string;
  /** Text alignment - use Tamagui's ta prop */
  textAlign?: "left" | "center" | "right" | "auto" | "justify";
}

const MyText: React.FC<MyTextProps> = ({ style, weight, textAlign, ...rest }) => {
  const fontFamily = weight ? FONT_WEIGHT_MAP[weight] ?? "MPlusRounded500" : "MPlusRounded500";

  return (
    <Text
      style={[{ fontFamily, ...(textAlign && { textAlign }) }, style]}
      color={"$textPrimary"}
      {...rest}
    />
  );
};

export default MyText;
