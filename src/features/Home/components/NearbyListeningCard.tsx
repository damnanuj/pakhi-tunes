import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Radio } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";

export default function NearbyListeningCard() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/home/nearby")}
      style={{ paddingHorizontal: scale(20) }}
    >
      <XStack
        items="center"
        gap={scale(14)}
        p={scale(16)}
        rounded={moderateScale(16)}
        bg={themeColors.dark.surfaceSecondary}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
      >
        <View
          style={{
            width: moderateScale(48),
            height: moderateScale(48),
            borderRadius: moderateScale(24),
            backgroundColor: themeColors.dark.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Radio size={moderateScale(22)} color={themeColors.dark.accent} />
        </View>
        <YStack flex={1} gap={verticalScale(4)}>
          <MyText fontSize={moderateScale(16)} weight="700" color={themeColors.dark.onSurface}>
            Listen nearby
          </MyText>
          <MyText fontSize={moderateScale(13)} weight="500" color={themeColors.dark.textMuted}>
            Scan for people playing music around you
          </MyText>
        </YStack>
        <MyText fontSize={moderateScale(13)} weight="700" color={themeColors.dark.accent}>
          Scan
        </MyText>
      </XStack>
    </Pressable>
  );
}
