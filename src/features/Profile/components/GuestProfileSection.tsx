import { TouchableOpacity, StyleSheet } from "react-native";
import { YStack } from "tamagui";
import { scale, moderateScale, verticalScale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import ProfileSection from "./ProfileSection";
import themeColors from "src/utils/theme/colors";

const GUEST_AVATAR = require("../../../../assets/images/icon.png");

type GuestProfileSectionProps = {
  onLoginPress: () => void;
};

export default function GuestProfileSection({ onLoginPress }: GuestProfileSectionProps) {
  return (
    <YStack gap={verticalScale(24)} >
      <ProfileSection
        avatarSource={GUEST_AVATAR}
        name="Guest"
        subtitle="Sign in to sync favourites across devices"
        showEditButton={false}
      />
      <TouchableOpacity
        onPress={onLoginPress}
        style={styles.loginButton}
        activeOpacity={0.85}
      >
        <MyText
          fontSize={moderateScale(14)}
          weight="700"
          color={themeColors.dark.onAccent}
        >
          Log in
        </MyText>
      </TouchableOpacity>
    </YStack>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    alignSelf: "flex-start",
    backgroundColor: themeColors.dark.accent,
    paddingHorizontal: scale(22),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
  },
});
