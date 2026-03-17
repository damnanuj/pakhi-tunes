import { XStack, YStack } from "tamagui";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import CircularButton from "src/components/CircularButton";
import themeColors from "src/utils/theme/colors";
import { Bell, Settings } from "@tamagui/lucide-icons";

export default function HomeHeader() {
  return (
    <XStack
      px={scale(20)}
      py={verticalScale(20)}
      justify="space-between"
      items="center"
    >
      <MyText
        fontSize={moderateScale(16)}
        fontWeight="600"
        color={themeColors.dark.onSurface}
      >
        Pakhi Tunes
      </MyText>
      <XStack gap={scale(10)} items="center">
        <CircularButton>
          <YStack items="center" justify="center">
            <MyText fontSize={moderateScale(8)} color={themeColors.dark.accent}>
              FREE
            </MyText>
            <MyText fontSize={moderateScale(8)} color={themeColors.dark.accent}>
              MUSIC
            </MyText>
          </YStack>
        </CircularButton>
        <CircularButton>
          <Bell size={moderateScale(20)} color={themeColors.dark.onSurface} />
        </CircularButton>
        <CircularButton>
          <Settings size={moderateScale(20)} color={themeColors.dark.onSurface} />
        </CircularButton>
      </XStack>
    </XStack>
  );
}
