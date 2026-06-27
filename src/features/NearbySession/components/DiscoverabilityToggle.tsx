import { useCallback, useState } from "react";
import { Radio } from "@tamagui/lucide-icons";
import { Switch, YStack } from "tamagui";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { appToast } from "src/components/toast/appToastHelpers";
import themeColors from "src/utils/theme/colors";
import { verticalScale } from "src/utils/functions/dimensions";
import ProfileMenuItem from "src/features/Profile/components/ProfileMenuItem";
import ConfirmDialog from "src/components/ConfirmDialog";
import { updateDiscoverable } from "../services/session.service";
import {
  LOCATION_PERMISSION_MESSAGE,
  openAppSettings,
  requestLocationPermission,
} from "../utils/locationPermission";

export default function DiscoverabilityToggle() {
  const { user, isAuthenticated, setUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);

  const discoverable = Boolean(user?.discoverable);

  const applyDiscoverable = useCallback(
    async (next: boolean) => {
      if (!user) return;
      setIsUpdating(true);
      try {
        const updated = await updateDiscoverable(next);
        setUser(updated);
      } catch {
        appToast.error("Could not update nearby listening setting");
      } finally {
        setIsUpdating(false);
      }
    },
    [setUser, user]
  );

  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (!user) return;

      if (checked) {
        setShowPermissionInfo(true);
        return;
      }

      await applyDiscoverable(false);
    },
    [applyDiscoverable, user]
  );

  const handlePermissionConfirm = useCallback(async () => {
    setShowPermissionInfo(false);
    if (!user) return;

    const granted = await requestLocationPermission();
    if (!granted) {
      setShowSettingsPrompt(true);
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateDiscoverable(true);
      setUser(updated);
      appToast.info(
        "Nearby listening is on. Others can find you while you play music."
      );
    } catch {
      appToast.error("Could not enable nearby listening");
    } finally {
      setIsUpdating(false);
    }
  }, [setUser, user]);

  if (!isAuthenticated || !user) return null;

  return (
    <>
      <YStack gap={verticalScale(12)}>
        <ProfileMenuItem
          icon={<Radio size={18} color={themeColors.dark.onSurface} />}
          label="Nearby Listening"
          trailing={
            <Switch
              checked={discoverable}
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

      <ConfirmDialog
        open={showPermissionInfo}
        onOpenChange={setShowPermissionInfo}
        title="Allow location access?"
        message={LOCATION_PERMISSION_MESSAGE}
        confirmLabel="Continue"
        cancelLabel="Not now"
        onConfirm={() => void handlePermissionConfirm()}
      />

      <ConfirmDialog
        open={showSettingsPrompt}
        onOpenChange={setShowSettingsPrompt}
        title="Location permission needed"
        message="Enable location in Settings to discover and share nearby listening sessions."
        confirmLabel="Open Settings"
        cancelLabel="Cancel"
        onConfirm={() => void openAppSettings()}
      />
    </>
  );
}
