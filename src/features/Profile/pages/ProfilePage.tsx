import React from "react";
import { ScrollView, View } from "react-native";
import { XStack, YStack } from "tamagui";
import { Heart, Download, Globe, Trash2, LogOut } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import Avatar from "src/components/Avatar";
import PrimaryButton from "src/components/PrimaryButton";
import ProfileMenuItem from "../components/ProfileMenuItem";
import MyText from "src/components/MyText";

// Placeholder avatar - replace with actual user image
const PLACEHOLDER_AVATAR = {
  uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
};

const MENU_ITEMS = [
  { icon: Heart, label: "Favourites", onPress: () => {} },
  { icon: Download, label: "Downloads", onPress: () => {} },
  { icon: Globe, label: "Language", onPress: () => {} },
  { icon: Trash2, label: "Clear cache", onPress: () => {} },
  { icon: LogOut, label: "Log out", onPress: () => {} },
];

export default function ProfilePage() {
  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="My profile" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(120),
        }}
      >
        {/* Profile section */}
        <XStack items="center" gap={scale(16)} mb={verticalScale(24)}>
          <Avatar source={PLACEHOLDER_AVATAR} size={moderateScale(72)} />
          <YStack flex={1} gap={verticalScale(4)}>
            <MyText
              fontSize={moderateScale(20)}
              weight="700"
              color={themeColors.dark.onSurface}
            >
              Charlotte King
            </MyText>
            <MyText
              fontSize={moderateScale(14)}
              weight="400"
              color={themeColors.dark.textMuted}
            >
              @johnkinggraphics
            </MyText>
            <View style={{ marginTop: verticalScale(12) }}>
              <PrimaryButton title="Edit profile" onPress={() => {}} />
            </View>
          </YStack>
        </XStack>

        {/* Menu items */}
        <YStack gap={verticalScale(12)}>
          {MENU_ITEMS.map((item) => (
            <ProfileMenuItem
              key={item.label}
              icon={
                <item.icon
                  size={moderateScale(18)}
                  color={themeColors.dark.onSurface}
                />
              }
              label={item.label}
              onPress={item.onPress}
            />
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
