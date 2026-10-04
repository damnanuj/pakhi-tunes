import { Image, UIManager, View } from "react-native";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import { verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

const PAKHI_LOTTIE = require("../../../../assets/lottie/pakhi-logo.json");
const PAKHI_BIRD_ICON = require("../../../../assets/images/pakhi-bird-icon.png");
const AUTH_BRAND_ICON_SIZE = moderateScale(156);
const LOGO_TOP_CROP = moderateScale(30);

function canPlayLottie() {
  try {
    return UIManager.getViewManagerConfig?.("LottieAnimationView") != null;
  } catch {
    return false;
  }
}

function AuthLogo() {
  if (canPlayLottie()) {
    const LottieView = require("lottie-react-native").default;
    return (
      <View
        style={{
          width: AUTH_BRAND_ICON_SIZE,
          height: AUTH_BRAND_ICON_SIZE - LOGO_TOP_CROP,
          overflow: "hidden",
          marginTop: -verticalScale(12),
        }}
      >
        <LottieView
          source={PAKHI_LOTTIE}
          autoPlay
          loop
          resizeMode="contain"
          style={{
            width: AUTH_BRAND_ICON_SIZE,
            height: AUTH_BRAND_ICON_SIZE,
            marginTop: -LOGO_TOP_CROP,
          }}
          accessibilityLabel="Pakhi Tunes"
        />
      </View>
    );
  }

  return (
    <Image
      source={PAKHI_BIRD_ICON}
      style={{
        width: AUTH_BRAND_ICON_SIZE,
        height: AUTH_BRAND_ICON_SIZE,
        marginTop: -verticalScale(12),
      }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessibilityLabel="Pakhi Tunes"
    />
  );
}

export default function AuthBranding() {
  return (
    <YStack justify="center" items="center" gap={verticalScale(4)}>
      <AuthLogo />

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
