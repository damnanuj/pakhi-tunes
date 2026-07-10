import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getTimeGreeting } from "src/utils/functions/getTimeGreeting";

export default function HomeGreeting() {
  const { user, isAuthenticated } = useAuth();
  const displayName = isAuthenticated && user?.name ? user.name : "Guest";

  return (
    <XStack px={scale(20)} width="100%">
      <MyText
        fontSize={moderateScale(20)}
        weight="700"
        color={themeColors.dark.onSurface}
      >
        {getTimeGreeting()}, {displayName}
      </MyText>
    </XStack>
  );
}
