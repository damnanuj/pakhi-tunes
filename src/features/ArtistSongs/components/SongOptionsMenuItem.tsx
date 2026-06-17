import type { ReactNode } from "react";
import { Pressable, type PressableStateCallbackType } from "react-native";
import { XStack } from "tamagui";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

const ROW_HEIGHT = verticalScale(44);

type SongOptionsMenuItemProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

export default function SongOptionsMenuItem({
  icon,
  label,
  onPress,
}: SongOptionsMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }: PressableStateCallbackType) => ({
        height: ROW_HEIGHT,
        borderRadius: moderateScale(10),
        backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent",
      })}
    >
      <XStack flex={1} items="center" gap={scale(12)} px={scale(12)}>
        {icon}
        <MyText
          fontSize={moderateScale(14)}
          weight="500"
          color={themeColors.dark.onSurface}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {label}
        </MyText>
      </XStack>
    </Pressable>
  );
}
