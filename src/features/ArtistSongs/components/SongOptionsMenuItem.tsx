import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableStateCallbackType,
} from "react-native";
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
  disabled?: boolean;
  loading?: boolean;
};

export default function SongOptionsMenuItem({
  icon,
  label,
  onPress,
  disabled = false,
  loading = false,
}: SongOptionsMenuItemProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }: PressableStateCallbackType) => ({
        minHeight: ROW_HEIGHT,
        borderRadius: moderateScale(10),
        backgroundColor:
          pressed && !isDisabled ? "rgba(255,255,255,0.06)" : "transparent",
        opacity: isDisabled ? 0.5 : 1,
      })}
    >
      <XStack
        items="center"
        gap={scale(12)}
        px={scale(12)}
        py={verticalScale(10)}
      >
        <View style={{ width: moderateScale(20), alignItems: "center" }}>
          {loading ? (
            <ActivityIndicator size="small" color={themeColors.dark.onSurface} />
          ) : (
            icon
          )}
        </View>
        <MyText
          fontSize={moderateScale(14)}
          weight="500"
          color={themeColors.dark.onSurface}
        >
          {label}
        </MyText>
      </XStack>
    </Pressable>
  );
}
