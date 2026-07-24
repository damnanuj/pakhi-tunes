import { LogOut } from "@tamagui/lucide-icons";
import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import ProfileMenuItem from "./ProfileMenuItem";
import ProfileStreamQualityItem from "./ProfileStreamQualityItem";
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
  return (
    <YStack gap={verticalScale(12)} mt={verticalScale(24)}>
      <ProfileStreamQualityItem />
      <DiscoverabilityToggle />
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
