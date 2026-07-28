import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { useNearbySessionStore } from "../store/nearbySessionStore";

/**
 * Soft banner while the host socket is briefly down.
 * Room stays alive until the server emits session:ended after the grace window.
 */
export default function HostReconnectingBanner() {
  const role = useNearbySessionStore((s) => s.role);
  const isHostConnected = useNearbySessionStore((s) => s.isHostConnected);

  if (role !== "listener" || isHostConnected) return null;

  return (
    <XStack
      items="center"
      justify="center"
      px={scale(12)}
      py={verticalScale(8)}
      rounded={moderateScale(10)}
      bg={themeColors.dark.surfaceSecondary}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
      style={{ alignSelf: "stretch" }}
    >
      <MyText
        fontSize={moderateScale(12)}
        weight="600"
        color={themeColors.dark.accent}
        textAlign="center"
      >
        Host reconnecting… room is still open
      </MyText>
    </XStack>
  );
}
