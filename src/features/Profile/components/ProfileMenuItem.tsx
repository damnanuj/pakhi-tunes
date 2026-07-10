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

const ITEM_HEIGHT = verticalScale(80);

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

export default function ProfileMenuItem({
  icon,
  label,
  labelColor,
  onPress,
  trailing,
}: ProfileMenuItemProps) {
  const content = (
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
        color={labelColor ?? themeColors.dark.onSurface}
        flex={1}
      >
        {label}
      </MyText>
      {trailing ?? (
        <ChevronRight
          size={moderateScale(20)}
          color={labelColor ?? themeColors.dark.onSurface}
        />
      )}
    </XStack>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.container}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.dark.surfaceSecondary,
    borderRadius: moderateScale(15),
    overflow: "hidden",
    minHeight: ITEM_HEIGHT,
  },
});
