import { Radio } from "@tamagui/lucide-icons";
import { Switch, XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";
import { NEARBY_HOME_REDIRECT } from "../utils/nearbyAuthGate";
import { useNearbyDiscoverability } from "../hooks/useNearbyDiscoverability";
import NearbyDiscoverabilityDialogs from "./NearbyDiscoverabilityDialogs";

export default function NearbyListeningControl() {
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
  } = useNearbyDiscoverability(NEARBY_HOME_REDIRECT);

  if (discoverable) {
    return null;
  }

  return (
    <>
      <YStack
        gap={verticalScale(4)}
        py={verticalScale(12)}
        px={scale(14)}
        rounded={moderateScale(15)}
        bg={themeColors.dark.surfaceSecondary}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
      >
        <XStack items="center" justify="space-between" gap={scale(12)}>
          <XStack items="center" gap={scale(10)} flex={1}>
            <Radio size={moderateScale(18)} color={themeColors.dark.onSurface} />
            <YStack flex={1} gap={verticalScale(2)}>
              <MyText
                fontSize={moderateScale(15)}
                weight="600"
                color={themeColors.dark.onSurface}
              >
                Nearby Listening
              </MyText>
              <MyText
                fontSize={moderateScale(12)}
                weight="500"
                color={themeColors.dark.textMuted}
              >
                Turn on to discover and share sessions nearby
              </MyText>
            </YStack>
          </XStack>
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
        </XStack>
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
