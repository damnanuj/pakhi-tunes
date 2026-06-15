import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import { verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

export default function AuthBranding() {
  return (
    <YStack justify={"center"} items={"center"} gap={verticalScale(10)}>
      <MyText
        borderColor={"red"}
        fontSize={moderateScale(100)}
        color={"$accentYellow"}
        style={{ fontFamily: "Sparkle" }}
      >
        P
      </MyText>

      <MyText
        borderColor={"green"}
        style={{ fontFamily: "NeoNeon" }}
        color={themeColors.dark.accent}
        fontSize={moderateScale(60)}
      >
        Pakhi Tunes
      </MyText>
    </YStack>
  );
}
