import React from "react";
import { XStack } from "tamagui";
import { ArrowLeft, ChevronDown, Settings } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import CircularButton from "./CircularButton";

export interface ScreenHeaderProps {
  /** Content for the left slot - icon, text, image, or any component */
  leftContent?: React.ReactNode;
  /** Content for the right slot - icon(s), buttons, or any component */
  rightContent?: React.ReactNode;
  /** Shorthand: renders as text in the left section when provided (ignored if leftContent is set) */
  title?: string;
  /** Convenience: show back button on left when no leftContent. Default: false */
  showBack?: boolean;
  /** Back button icon when showBack is true. Use "down" for sheets that dismiss downward. */
  backIcon?: "arrow" | "down";
  /** Convenience: show settings icon on right when no rightContent. Default: false */
  showSettings?: boolean;
  /** Custom back press handler. Falls back to router.back() if not provided */
  onBackPress?: () => void;
  /** Custom settings press handler */
  onSettingsPress?: () => void;
}

/**
 * Unified header with left and right slots.
 * Pass any content (icons, text, images, components) to each slot.
 * Use title/showBack/showSettings for common patterns.
 */
export default function ScreenHeader({
  leftContent,
  rightContent,
  title,
  showBack = false,
  backIcon = "arrow",
  showSettings = false,
  onBackPress,
  onSettingsPress,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleSettings = () => {
    if (onSettingsPress) {
      onSettingsPress();
    }
  };

  const renderLeft = () => {
    if (leftContent != null) return leftContent;
    const backButton = showBack ? (
      <CircularButton onPress={handleBack}>
        {backIcon === "down" ? (
          <ChevronDown
            size={moderateScale(20)}
            color={themeColors.dark.onSurface}
          />
        ) : (
          <ArrowLeft
            size={moderateScale(20)}
            color={themeColors.dark.onSurface}
          />
        )}
      </CircularButton>
    ) : null;
    const titleText = title ? (
      <MyText
        fontSize={moderateScale(18)}
        weight="700"
        color={themeColors.dark.onSurface}
      >
        {title}
      </MyText>
    ) : null;
    if (backButton || titleText) {
      return (
        <XStack items="center" gap={scale(15)}>
          {backButton}
          {titleText}
        </XStack>
      );
    }
    return null;
  };

  const renderRight = () => {
    if (rightContent != null) return rightContent;
    if (showSettings) {
      return (
        <CircularButton onPress={handleSettings}>
          <Settings
            size={moderateScale(20)}
            color={themeColors.dark.onSurface}
          />
        </CircularButton>
      );
    }
    return null;
  };

  return (
    <XStack
      px={scale(20)}
      py={verticalScale(20)}
      justify="space-between"
      items="center"
    >
      <XStack flex={1} items="center" justify="flex-start">
        {renderLeft()}
      </XStack>
      <XStack flex={1} items="center" justify="flex-end">
        {renderRight()}
      </XStack>
    </XStack>
  );
}
