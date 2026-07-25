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
import ProfileLibraryShortcuts from "../components/ProfileLibraryShortcuts";
import ProfileMenu from "../components/ProfileMenu";
import ProfileCreatorFooter from "../components/ProfileCreatorFooter";
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

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    const displayName = user?.name ?? "Guest";
    try {
      const { unlinkDeviceUser } = await import(
        "src/features/notifications/services/deviceRegistration"
      );
      await unlinkDeviceUser();
    } catch {
      // Non-blocking — device stays registered for broadcasts either way
    }
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

        <ProfileLibraryShortcuts />

        <ProfileMenu
          isAuthenticated={isAuthenticated}
          onLogoutPress={handleLogoutPress}
        />

        <ProfileCreatorFooter />
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
