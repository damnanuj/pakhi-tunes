import { LogOut } from "@tamagui/lucide-icons";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ProfileMenuItem from "./ProfileMenuItem";

type ProfileMenuProps = {
  isAuthenticated: boolean;
  onLogoutPress: () => void;
};

export default function ProfileMenu({
  isAuthenticated,
  onLogoutPress,
}: ProfileMenuProps) {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <YStack gap={verticalScale(12)} mt={verticalScale(24)}>
      <ProfileMenuItem
        icon={<LogOut size={18} color={themeColors.dark.onSurface} />}
        label="Log out"
        onPress={onLogoutPress}
      />
    </YStack>
  );
}
