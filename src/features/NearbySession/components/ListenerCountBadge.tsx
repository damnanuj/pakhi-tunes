import { Headphones } from "@tamagui/lucide-icons";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale } from "src/utils/functions/dimensions";

type ListenerCountBadgeProps = {
  count: number;
  compact?: boolean;
};

export default function ListenerCountBadge({
  count,
  compact = false,
}: ListenerCountBadgeProps) {
  if (compact) {
    return (
      <XStack
        items="center"
        justify="center"
        gap={scale(5)}
        height={moderateScale(44)}
        px={scale(10)}
        rounded={moderateScale(22)}
        bg={themeColors.dark.surface}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
      >
        <Headphones size={moderateScale(16)} color={themeColors.dark.accent} />
        <MyText
          fontSize={moderateScale(12)}
          weight="700"
          color={themeColors.dark.accent}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {count}
        </MyText>
      </XStack>
    );
  }

  return (
    <XStack
      items="center"
      justify="center"
      gap={scale(6)}
      py={scale(6)}
      px={scale(12)}
      rounded={moderateScale(20)}
      bg={themeColors.dark.surface}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
    >
      <Headphones size={moderateScale(14)} color={themeColors.dark.accent} />
      <MyText
        fontSize={moderateScale(12)}
        weight="700"
        color={themeColors.dark.accent}
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {count}
      </MyText>
    </XStack>
  );
}
