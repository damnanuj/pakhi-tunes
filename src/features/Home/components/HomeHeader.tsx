import { XStack, Button, YStack } from "tamagui";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/customTabBars/styleComponents/MyText";
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
        color={themeColors.dark.WHITE}
      >
        Pakhi Tunes
      </MyText>
      <XStack gap={scale(10)} items="center">
        <Button
          size="$3.5"
          chromeless
          borderWidth={1}
          borderColor={themeColors.dark.BORDER_PRIMARY}
          circular
          width={moderateScale(44)}
          height={moderateScale(44)}
        >
          <YStack items="center" justify="center">
            <MyText fontSize={moderateScale(8)} color={themeColors.dark.YELLOW}>
              FREE
            </MyText>
            <MyText fontSize={moderateScale(8)} color={themeColors.dark.YELLOW}>
              MUSIC
            </MyText>
          </YStack>
        </Button>
        <Button
          size="$3.5"
          chromeless
          borderWidth={1}
          borderColor={themeColors.dark.BORDER_PRIMARY}
          circular
          width={moderateScale(44)}
          height={moderateScale(44)}
        >
          <Bell size={moderateScale(20)} color={themeColors.dark.WHITE} />
        </Button>
        <Button
          size="$3.5"
          chromeless
          borderWidth={1}
          borderColor={themeColors.dark.BORDER_PRIMARY}
          circular
          width={moderateScale(44)}
          height={moderateScale(44)}
        >
          <Settings size={moderateScale(20)} color={themeColors.dark.WHITE} />
        </Button>
      </XStack>
    </XStack>
  );
}
