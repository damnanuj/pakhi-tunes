import { useState } from "react";
import { LogOut, Settings } from "@tamagui/lucide-icons";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ProfileMenuItem from "./ProfileMenuItem";
import PreferencesSheet from "./PreferencesSheet";
import DiscoverabilityToggle from "src/features/NearbySession/components/DiscoverabilityToggle";

type ProfileMenuProps = {
  isAuthenticated: boolean;
  onLogoutPress: () => void;
};

const LOGOUT_COLOR = "#f87171";

export default function ProfileMenu({
  isAuthenticated,
  onLogoutPress,
}: ProfileMenuProps) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  return (
    <YStack gap={verticalScale(12)} mt={verticalScale(24)}>
      <ProfileMenuItem
        icon={<Settings size={18} color={themeColors.dark.onSurface} />}
        label="Preferences"
        onPress={() => setPreferencesOpen(true)}
      />
      <DiscoverabilityToggle />
      <PreferencesSheet
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
      {isAuthenticated ? (
        <ProfileMenuItem
          icon={<LogOut size={18} color={LOGOUT_COLOR} />}
          label="Log out"
          labelColor={LOGOUT_COLOR}
          onPress={onLogoutPress}
        />
      ) : null}
    </YStack>
  );
}
