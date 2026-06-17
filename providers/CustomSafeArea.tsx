import React from "react";
import { StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";
import NetworkBanner from "src/components/NetworkBanner";

export default function CustomSafeArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;

  return (
    <YStack
      flex={1}
      mt={statusBarHeight}
      mb={insets.bottom}
    >
      <NetworkBanner />
      <YStack flex={1}>{children}</YStack>
    </YStack>
  );
}
