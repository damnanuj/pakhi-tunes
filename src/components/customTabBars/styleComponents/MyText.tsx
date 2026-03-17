import React from "react";
import themeColors from "src/utils/theme/colors";
import { Text, TextProps } from "tamagui";

interface MyTextProps extends TextProps {}

const MyText: React.FC<MyTextProps> = ({ style, ...rest }) => {
  return (
    <Text
      style={[{ fontFamily: "MPlusRounded500" }, style]}
      //   fontWeight="$4"
      color={"$textPrimary"}
      {...rest}
    />
  );
};

export default MyText;
