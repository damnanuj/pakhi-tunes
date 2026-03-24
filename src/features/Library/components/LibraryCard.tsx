import { Image, TouchableOpacity, View } from "react-native";
import { ArrowUpRight, Play } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

export interface LibraryCardProps {
  id: string;
  imageUrl: string;
  title: string;
  /** Optional line under the title (e.g. type or artists). */
  subtitle?: string;
  /** Right-side affordance: album-style arrow vs play (e.g. songs). */
  trailingAction?: "arrow" | "play";
  onPress?: () => void;
}

export default function LibraryCard({
  imageUrl,
  title,
  subtitle,
  trailingAction = "arrow",
  onPress,
}: LibraryCardProps) {
  const isPlay = trailingAction === "play";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: moderateScale(16),
        overflow: "hidden",
        backgroundColor: themeColors.dark.surfaceSecondary,
        borderWidth: 1,
        borderColor: themeColors.dark.borderSecondary,
        padding: scale(12),
      }}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 1.2,
          overflow: "hidden",
          borderRadius: moderateScale(10),
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: moderateScale(10),
          }}
          resizeMode="cover"
        />
      </View>
      <View
        style={{
          paddingTop: verticalScale(12),
          flexDirection: "row",
          alignItems: subtitle ? "flex-start" : "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, minWidth: 0, marginRight: scale(8) }}>
          <MyText
            fontSize={moderateScale(14)}
            weight="700"
            color={themeColors.dark.onSurface}
            numberOfLines={subtitle ? 2 : 1}
          >
            {title}
          </MyText>
          {subtitle ? (
            <MyText
              fontSize={moderateScale(12)}
              weight="500"
              color={themeColors.dark.textMuted}
              numberOfLines={1}
              style={{ marginTop: verticalScale(4) }}
            >
              {subtitle}
            </MyText>
          ) : null}
        </View>
        <View
          style={{
            width: moderateScale(28),
            height: moderateScale(28),
            borderRadius: moderateScale(14),
            backgroundColor: themeColors.dark.surface,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: scale(8),
          }}
        >
          {isPlay ? (
            <Play
              size={moderateScale(16)}
              color={themeColors.dark.onSurface}
            />
          ) : (
            <ArrowUpRight
              size={moderateScale(16)}
              color={themeColors.dark.onSurface}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
