import React from "react";
import { View, ImageSourcePropType } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import Avatar from "src/components/Avatar";
import MyText from "src/components/MyText";
import EditProfileButton from "./EditProfileButton";
import themeColors from "src/utils/theme/colors";

interface ProfileSectionProps {
  avatarSource: ImageSourcePropType;
  name: string;
  subtitle: string;
  onEditPress?: () => void;
  showEditButton?: boolean;
}

export default function ProfileSection({
  avatarSource,
  name,
  subtitle,
  onEditPress,
  showEditButton = true,
}: ProfileSectionProps) {
  return (
    <XStack items="center" gap={scale(20)} mb={verticalScale(24)}>
      <Avatar source={avatarSource} size={moderateScale(100)} />
      <YStack flex={1} gap={verticalScale(4)}>
        <MyText
          fontSize={moderateScale(20)}
          weight="700"
          color={themeColors.dark.onSurface}
        >
          {name}
        </MyText>
        <MyText
          fontSize={moderateScale(14)}
          weight="400"
          color={themeColors.dark.textMuted}
        >
          {subtitle}
        </MyText>
        {showEditButton ? (
          <View style={{ marginTop: verticalScale(12), alignSelf: "flex-start" }}>
            <EditProfileButton onPress={onEditPress} />
          </View>
        ) : null}
      </YStack>
    </XStack>
  );
}
