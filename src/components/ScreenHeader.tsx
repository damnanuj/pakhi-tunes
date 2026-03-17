import React from "react";
import { XStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowBigLeft, ArrowLeft, ChevronLeft, Settings } from "@tamagui/lucide-icons";
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
  /** Dynamic text showing the current screen name (displayed in center) */
  title: string;
  /** Show back button (ChevronLeft) on the left. Default: true */
  showBack?: boolean;
  /** Show settings icon on the right. Default: true */
  showSettings?: boolean;
  /** Custom back press handler. Falls back to router.back() if not provided */
  onBackPress?: () => void;
  /** Custom settings press handler */
  onSettingsPress?: () => void;
  /** Optional custom content for the left slot (overrides back button when provided) */
  leftContent?: React.ReactNode;
  /** Optional custom content for the right slot (overrides settings icon when provided) */
  rightContent?: React.ReactNode;
}

/**
 * Reusable screen header with:
 * - Back button (ChevronLeft) on the left
 * - Dynamic screen name in the center
 * - Settings icon on the right
 */
export default function ScreenHeader({
  title,
  showBack = true,
  showSettings = true,
  onBackPress,
  onSettingsPress,
  leftContent,
  rightContent,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    if (leftContent) return leftContent;
    if (!showBack) {
      return (
        <CircularButton>
          <ArrowLeft
            size={moderateScale(20)}
            color={themeColors.dark.onSurface}
          />
        </CircularButton>
      );
    }
    return null;
  };

  const renderRight = () => {
    if (rightContent) return rightContent;
    if (showSettings) {
      return (
        <CircularButton>
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
      <XStack flex={1} items="center" justify="flex-start" gap={scale(15)}>
        {renderLeft()}
        <MyText
          fontSize={moderateScale(18)}
          weight="700"
          color={themeColors.dark.onSurface}
        >
          {title}
        </MyText>
      </XStack>
      <XStack flex={1} items="center" justify="flex-end">
        {renderRight()}
      </XStack>
    </XStack>
  );
}
