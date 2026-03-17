import React from "react";
import { StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, YStack } from "tamagui";

export default function CustomSafeArea({ children }) {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;

  return (
    <YStack
      flex={1}
      mt={statusBarHeight}
      mb={insets.bottom} // dynamic bottom padding
    >
      {children}
    </YStack>
  );
}
