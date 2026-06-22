import React, { useState } from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ConfirmDialog from "src/components/ConfirmDialog";
import ScreenHeader from "src/components/ScreenHeader";
import { useScrollBottomInset } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { appToast } from "src/components/toast/appToastHelpers";
import GuestProfileSection from "../components/GuestProfileSection";
import AuthenticatedProfileSection from "../components/AuthenticatedProfileSection";
import ProfileMenu from "../components/ProfileMenu";
import { FAVORITES_QUERY_KEY } from "src/features/favorites/hooks/useFavorites";
import { HISTORY_QUERY_KEY } from "src/features/history/hooks/useHistoryList";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    const displayName = user?.name ?? "Guest";
    logout();
    void queryClient.removeQueries({ queryKey: FAVORITES_QUERY_KEY });
    void queryClient.removeQueries({ queryKey: HISTORY_QUERY_KEY });
    appToast.loggedOut(displayName);
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

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
      />
    </YStack>
  );
}
