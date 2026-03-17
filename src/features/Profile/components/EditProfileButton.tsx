import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { scale, moderateScale, verticalScale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

interface EditProfileButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

export default function EditProfileButton({
  onPress,
  disabled = false,
}: EditProfileButtonProps) {
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
        Edit profile
      </MyText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColors.dark.accent,
    paddingHorizontal: scale(22),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
