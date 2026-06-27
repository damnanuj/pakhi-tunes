import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Radio } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";

const RING_SIZES = [moderateScale(52), moderateScale(40), moderateScale(28)];

export default function NearbyListeningCard() {
  const router = useRouter();
  const accent = themeColors.dark.accent;

  return (
    <Pressable
      onPress={() => router.push("/home/nearby")}
      style={{ paddingHorizontal: scale(20) }}
    >
      <View
        style={{
          borderRadius: moderateScale(16),
          overflow: "hidden",
          backgroundColor: themeColors.dark.surfaceSecondary,
          borderWidth: 1,
          borderColor: themeColors.dark.borderSecondary,
        }}
      >
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "42%",
            backgroundColor: accent,
            opacity: 0.08,
          }}
        />

        <XStack items="center" gap={scale(12)} py={verticalScale(12)} px={scale(14)}>
          <View
            style={{
              width: moderateScale(52),
              height: moderateScale(52),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {RING_SIZES.map((size) => (
              <View
                key={size}
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 1,
                  borderColor: `${accent}33`,
                }}
              />
            ))}
            <View
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: moderateScale(18),
                backgroundColor: themeColors.dark.surface,
                borderWidth: 1.5,
                borderColor: accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Radio size={moderateScale(16)} color={accent} />
            </View>
          </View>

          <YStack flex={1} gap={verticalScale(2)} style={{ minWidth: 0 }}>
            <MyText
              fontSize={moderateScale(15)}
              weight="700"
              color={themeColors.dark.onSurface}
              numberOfLines={1}
            >
              Nearby sessions
            </MyText>
            <MyText
              fontSize={moderateScale(12)}
              weight="500"
              color={themeColors.dark.textMuted}
              numberOfLines={1}
            >
              Tap to scan live listeners
            </MyText>
          </YStack>

          <View
            style={{
              paddingHorizontal: scale(10),
              paddingVertical: verticalScale(5),
              borderRadius: moderateScale(12),
              backgroundColor: `${accent}18`,
              borderWidth: 1,
              borderColor: `${accent}40`,
            }}
          >
            <MyText
              fontSize={moderateScale(11)}
              weight="700"
              color={accent}
            >
              Scan
            </MyText>
          </View>
        </XStack>
      </View>
    </Pressable>
  );
}
