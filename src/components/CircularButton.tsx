import React from "react";
import { Button } from "tamagui";
import { moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

export interface CircularButtonProps {
  /** Content to render inside the button (icon, text, or custom) */
  children: React.ReactNode;
  /** Optional press handler */
  onPress?: () => void;
  /** Button size in pixels. Default: 44 */
  size?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Reusable circular button container with border.
 * Use for icons, text, or any content in header/action bars.
 */
export default function CircularButton({
  children,
  onPress,
  size = moderateScale(44),
  accessibilityLabel,
}: CircularButtonProps) {
  return (
    <Button
      size="$3.5"
      chromeless
      borderWidth={1}
      borderColor={themeColors.dark.border}
      circular
      width={size}
      height={size}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Button>
  );
}
