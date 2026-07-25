import { Headphones } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale } from "src/utils/functions/dimensions";

type ListenerCountBadgeProps = {
  count: number;
  compact?: boolean;
  onPress?: () => void;
};

export default function ListenerCountBadge({
  count,
  compact = false,
  onPress,
}: ListenerCountBadgeProps) {
  const badge = (
    <XStack
      items="center"
      justify="center"
      gap={scale(compact ? 5 : 6)}
      height={compact ? moderateScale(44) : undefined}
      py={compact ? undefined : scale(6)}
      px={compact ? scale(10) : scale(12)}
      rounded={moderateScale(compact ? 22 : 20)}
      bg={themeColors.dark.surface}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
    >
      <Headphones
        size={moderateScale(compact ? 16 : 14)}
        color={themeColors.dark.accent}
      />
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

  if (!onPress) return badge;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open Listen Together, ${count} listeners`}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      {badge}
    </Pressable>
  );
}
