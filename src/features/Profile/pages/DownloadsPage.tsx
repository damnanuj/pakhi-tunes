import React from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { scale, moderateScale, verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import ScreenHeader from "src/components/ScreenHeader";
import { useMiniPlayerBottomInset } from "src/features/Player";

export default function DownloadsPage() {
  const miniPlayerInset = useMiniPlayerBottomInset();

  return (
    <YStack flex={1} background={themeColors.dark.background}>
      <ScreenHeader title="Downloads" showBack showSettings={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(32) + miniPlayerInset,
        }}
      >
        <MyText
          fontSize={moderateScale(16)}
          weight="500"
          color={themeColors.dark.textMuted}
          mt={verticalScale(24)}
        >
          Your downloaded tracks will appear here.
        </MyText>
      </ScrollView>
    </YStack>
  );
}
