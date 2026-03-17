import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
}

export default function IconButton({
  icon,
  onPress,
  size = moderateScale(44),
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { width: size, height: size }]}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
