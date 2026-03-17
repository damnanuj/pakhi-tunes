import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { XStack } from "tamagui";
import { ChevronRight } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import CircularButton from "src/components/CircularButton";
import themeColors from "src/utils/theme/colors";

const ITEM_HEIGHT = verticalScale(70);

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export default function ProfileMenuItem({
  icon,
  label,
  onPress,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <XStack
        flex={1}
        items="center"
        gap={scale(14)}
        px={scale(16)}
        py={verticalScale(12)}
      >
        <View pointerEvents="none">
          <CircularButton>{icon}</CircularButton>
        </View>
        <MyText
          fontSize={moderateScale(15)}
          weight="500"
          color={themeColors.dark.onSurface}
          flex={1}
        >
          {label}
        </MyText>
        <ChevronRight
          size={moderateScale(20)}
          color={themeColors.dark.onSurface}
        />
      </XStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.dark.surfaceSecondary,
    borderRadius: moderateScale(15),
    overflow: "hidden",
    minHeight: ITEM_HEIGHT,
  },
});
