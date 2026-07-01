import { Platform } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Wifi, WifiOff } from "@tamagui/lucide-icons";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import { useNetwork } from "src/contexts/NetworkContext";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

export default function NetworkBanner() {
  const { bannerPhase } = useNetwork();

  const isVisible = bannerPhase !== "hidden";
  const isOffline = bannerPhase === "offline";
  const backgroundColor = isOffline ? "#7f1d1d" : "#14532d";
  const message = isOffline
    ? "You are offline — trying to reconnect…"
    : "Back online!";

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      pointerEvents="none"
      style={{
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        backgroundColor,
        ...(Platform.OS === "ios"
          ? {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }
          : { elevation: 8 }),
      }}
    >
      <XStack items="center" justify="center" gap={scale(8)}>
        {isOffline ? (
          <WifiOff size={moderateScale(16)} color="#fecaca" />
        ) : (
          <Wifi size={moderateScale(16)} color="#bbf7d0" />
        )}
        <MyText
          fontSize={moderateScale(13)}
          weight="600"
          color={isOffline ? "#fecaca" : "#bbf7d0"}
          textAlign="center"
        >
          {message}
        </MyText>
      </XStack>
    </Animated.View>
  );
}
