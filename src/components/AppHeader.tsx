import { Image } from "react-native";
import { XStack, YStack } from "tamagui";
import { Bell, Settings } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import CircularButton from "src/components/CircularButton";
import ScreenHeader from "src/components/ScreenHeader";

const PAKHI_BIRD_ICON = require("../../assets/images/pakhi-bird-icon.png");
const BRAND_ICON_SIZE = moderateScale(40);

/**
 * Reusable header for tab screens (Home, Search, Library).
 * Shows "Pakhi Tunes" on the left and FREE MUSIC badge, Bell, Settings on the right.
 */
export default function AppHeader() {
  return (
    <ScreenHeader
      leftContent={
        <XStack items="center" gap={scale(8)}>
          <Image
            source={PAKHI_BIRD_ICON}
            style={{
              width: BRAND_ICON_SIZE,
              height: BRAND_ICON_SIZE,
            }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <MyText
            fontSize={moderateScale(16)}
            weight="600"
            color={themeColors.dark.onSurface}
          >
            Pakhi Tunes
          </MyText>
        </XStack>
      }
      rightContent={
        <XStack gap={scale(10)} items="center">
          <CircularButton>
            <YStack items="center" justify="center">
              <MyText
                fontSize={moderateScale(8)}
                color={themeColors.dark.accent}
              >
                FREE
              </MyText>
              <MyText
                fontSize={moderateScale(8)}
                color={themeColors.dark.accent}
              >
                MUSIC
              </MyText>
            </YStack>
          </CircularButton>
          {/* <CircularButton>
            <Bell
              size={moderateScale(20)}
              color={themeColors.dark.onSurface}
            />
          </CircularButton> */}
          {/* <CircularButton>
            <Settings
              size={moderateScale(20)}
              color={themeColors.dark.onSurface}
            />
          </CircularButton> */}
        </XStack>
      }
    />
  );
}
