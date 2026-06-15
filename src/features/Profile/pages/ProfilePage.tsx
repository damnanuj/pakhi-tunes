import React from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import { useScrollBottomInset } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import GuestProfileSection from "../components/GuestProfileSection";
import AuthenticatedProfileSection from "../components/AuthenticatedProfileSection";
import ProfileMenu from "../components/ProfileMenu";
import { FAVORITES_QUERY_KEY } from "src/features/favorites/hooks/useFavorites";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(32),
  });

  const handleLoginPress = () => {
    router.push({
      pathname: "/auth",
      params: { mode: "signin", redirect: "/(tabs)/profile" },
    });
  };

  const handleFavouritesPress = () => {
    router.push("/(tabs)/profile/favourites");
  };

  const handleLogoutPress = () => {
    logout();
    void queryClient.removeQueries({ queryKey: FAVORITES_QUERY_KEY });
  };

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="My profile" showBack={false} showSettings={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: scrollBottomPadding,
        }}
      >
        {isAuthenticated && user ? (
          <AuthenticatedProfileSection user={user} />
        ) : (
          <GuestProfileSection onLoginPress={handleLoginPress} />
        )}

        <ProfileMenu
          isAuthenticated={isAuthenticated}
          onFavouritesPress={handleFavouritesPress}
          onLogoutPress={handleLogoutPress}
        />
      </ScrollView>
    </YStack>
  );
}
