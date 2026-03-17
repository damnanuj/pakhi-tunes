import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { scale, moderateScale, verticalScale } from "src/utils/functions/dimensions";
import MyText from "src/components/customTabBars/styleComponents/MyText";
import themeColors from "src/utils/theme/colors";

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <MyText
        fontSize={moderateScale(14)}
        weight="700"
        color={themeColors.dark.onAccent}
      >
        {title}
      </MyText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColors.dark.accent,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
