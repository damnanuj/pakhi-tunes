import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Radio } from "@tamagui/lucide-icons";
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
        gap={scale(12)}
        py={verticalScale(10)}
        px={scale(12)}
        rounded={moderateScale(14)}
        bg={themeColors.dark.surfaceSecondary}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
        borderLeftWidth={moderateScale(3)}
        borderLeftColor={themeColors.dark.accent}
      >
        <View
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: moderateScale(20),
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Radio size={moderateScale(18)} color={themeColors.dark.accent} />
        </View>
        <YStack flex={1} gap={verticalScale(2)} style={{ minWidth: 0 }}>
          <MyText
            fontSize={moderateScale(15)}
            weight="700"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            Listen nearby
          </MyText>
          <MyText
            fontSize={moderateScale(12)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            Find sessions around you
          </MyText>
        </YStack>
        <ChevronRight
          size={moderateScale(18)}
          color={themeColors.dark.textMuted}
        />
      </XStack>
    </Pressable>
  );
}
