import { Image, TouchableOpacity, View } from "react-native";
import { ArrowUpRight } from "@tamagui/lucide-icons";
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
  onPress?: () => void;
}

export default function LibraryCard({
  imageUrl,
  title,
  onPress,
}: LibraryCardProps) {
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <MyText
          fontSize={moderateScale(14)}
          weight="700"
          color={themeColors.dark.onSurface}
          numberOfLines={1}
          flex={1}
        >
          {title}
        </MyText>
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
          <ArrowUpRight
            size={moderateScale(16)}
            color={themeColors.dark.onSurface}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
