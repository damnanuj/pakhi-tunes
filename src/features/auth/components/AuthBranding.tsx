import { Image } from "react-native";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import { verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

const PAKHI_BIRD_ICON = require("../../../../assets/images/pakhi-bird-icon.png");
const AUTH_BRAND_ICON_SIZE = moderateScale(110);

export default function AuthBranding() {
  return (
    <YStack justify="center" items="center" gap={verticalScale(10)}>
      <Image
        source={PAKHI_BIRD_ICON}
        style={{
          width: AUTH_BRAND_ICON_SIZE,
          height: AUTH_BRAND_ICON_SIZE,
        }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="Pakhi Tunes"
      />

      <MyText
        style={{ fontFamily: "NeoNeon" }}
        color={themeColors.dark.accent}
        fontSize={moderateScale(60)}
      >
        Pakhi Tunes
      </MyText>
    </YStack>
  );
}
