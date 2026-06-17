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

/**
 * Reusable header for tab screens (Home, Search, Library).
 * Shows "Pakhi Tunes" on the left and FREE MUSIC badge, Bell, Settings on the right.
 */
export default function AppHeader() {
  return (
    <ScreenHeader
      leftContent={
        <MyText
          fontSize={moderateScale(16)}
          weight="600"
          color={themeColors.dark.onSurface}
        >
          Pakhi Tunes
        </MyText>
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
