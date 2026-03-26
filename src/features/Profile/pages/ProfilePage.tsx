import React from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { Heart, Download, Globe, Trash2, LogOut } from "@tamagui/lucide-icons";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import { useScrollBottomInset } from "src/hooks";
import ProfileSection from "../components/ProfileSection";
import ProfileMenuItem from "../components/ProfileMenuItem";

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
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(32),
  });

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="My profile" showBack={false} showSettings />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: scrollBottomPadding,
        }}
      >
        <ProfileSection
          avatarSource={PLACEHOLDER_AVATAR}
          name="Charlotte King"
          username="@johnkinggraphics"
          onEditPress={() => {}}
        />

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
