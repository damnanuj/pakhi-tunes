import { Radio } from "@tamagui/lucide-icons";
import { Switch, YStack } from "tamagui";
import themeColors from "src/utils/theme/colors";
import { verticalScale } from "src/utils/functions/dimensions";
import ProfileMenuItem from "src/features/Profile/components/ProfileMenuItem";
import { useNearbyDiscoverability } from "../hooks/useNearbyDiscoverability";
import NearbyDiscoverabilityDialogs from "./NearbyDiscoverabilityDialogs";

export default function DiscoverabilityToggle() {
  const {
    discoverable,
    isAuthenticated,
    isUpdating,
    handleToggle,
    showPermissionInfo,
    setShowPermissionInfo,
    showSettingsPrompt,
    setShowSettingsPrompt,
    handlePermissionConfirm,
  } = useNearbyDiscoverability();

  return (
    <>
      <YStack gap={verticalScale(12)}>
        <ProfileMenuItem
          icon={<Radio size={18} color={themeColors.dark.onSurface} />}
          label="Nearby Listening"
          trailing={
            <Switch
              checked={isAuthenticated ? discoverable : false}
              onCheckedChange={(checked) => void handleToggle(Boolean(checked))}
              disabled={isUpdating}
              backgroundColor={
                discoverable
                  ? themeColors.dark.accent
                  : themeColors.dark.surface
              }
            >
              <Switch.Thumb animation="quick" />
            </Switch>
          }
        />
      </YStack>

      <NearbyDiscoverabilityDialogs
        showPermissionInfo={showPermissionInfo}
        setShowPermissionInfo={setShowPermissionInfo}
        showSettingsPrompt={showSettingsPrompt}
        setShowSettingsPrompt={setShowSettingsPrompt}
        onPermissionConfirm={() => void handlePermissionConfirm()}
      />
    </>
  );
}
