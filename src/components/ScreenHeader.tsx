import React from "react";
import { XStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Settings } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import IconButton from "src/components/IconButton";
import themeColors from "src/utils/theme/colors";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
}

export default function ScreenHeader({
  title,
  showBack = true,
  showSettings = true,
  onBackPress,
  onSettingsPress,
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
    // Could navigate to settings screen if needed
  };

  return (
    <XStack
      px={scale(20)}
      pt={insets.top + verticalScale(12)}
      pb={verticalScale(16)}
      background={themeColors.dark.background}
      justify="space-between"
      items="center"
    >
      <XStack flex={1} items="center" justify="flex-start">
        {showBack && (
          <IconButton
            icon={
              <ChevronLeft
                size={moderateScale(24)}
                color={themeColors.dark.onSurface}
              />
            }
            onPress={handleBack}
            accessibilityLabel="Go back"
          />
        )}
      </XStack>
      <XStack flex={1} justify="center">
        <MyText
          fontSize={moderateScale(18)}
          weight="700"
          color={themeColors.dark.onSurface}
        >
          {title}
        </MyText>
      </XStack>
      <XStack flex={1} items="center" justify="flex-end">
        {showSettings && (
          <IconButton
            icon={
              <Settings
                size={moderateScale(22)}
                color={themeColors.dark.onSurface}
              />
            }
            onPress={handleSettings}
            accessibilityLabel="Settings"
          />
        )}
      </XStack>
    </XStack>
  );
}
