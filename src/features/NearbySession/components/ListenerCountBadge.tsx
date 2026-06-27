import { Headphones } from "@tamagui/lucide-icons";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";

type ListenerCountBadgeProps = {
  count: number;
};

export default function ListenerCountBadge({ count }: ListenerCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <XStack
      items="center"
      justify="center"
      gap={scale(6)}
      py={verticalScale(6)}
      px={scale(12)}
      rounded={moderateScale(20)}
      bg={themeColors.dark.surface}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
    >
      <Headphones size={moderateScale(14)} color={themeColors.dark.accent} />
      <MyText fontSize={moderateScale(12)} weight="700" color={themeColors.dark.accent}>
        {count} listening with you
      </MyText>
    </XStack>
  );
}
