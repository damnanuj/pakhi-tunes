import { Heart, Download, LogOut } from "@tamagui/lucide-icons";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ProfileMenuItem from "./ProfileMenuItem";

type ProfileMenuProps = {
  isAuthenticated: boolean;
  onFavouritesPress: () => void;
  onLogoutPress: () => void;
};

export default function ProfileMenu({
  isAuthenticated,
  onFavouritesPress,
  onLogoutPress,
}: ProfileMenuProps) {
  const items = [
    { icon: Heart, label: "Favourites", onPress: onFavouritesPress },
    { icon: Download, label: "Downloads", onPress: () => {} },
    ...(isAuthenticated
      ? [{ icon: LogOut, label: "Log out", onPress: onLogoutPress }]
      : []),
  ];

  return (
    <YStack gap={verticalScale(12)}>
      {items.map((item) => (
        <ProfileMenuItem
          key={item.label}
          icon={
            <item.icon
              size={18}
              color={themeColors.dark.onSurface}
            />
          }
          label={item.label}
          onPress={item.onPress}
        />
      ))}
    </YStack>
  );
}
