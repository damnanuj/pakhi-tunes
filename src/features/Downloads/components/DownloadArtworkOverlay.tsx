import { View } from "react-native";
import { Check } from "@tamagui/lucide-icons";
import { moderateScale } from "src/utils/functions/dimensions";
import DownloadProgressRing from "./DownloadProgressRing";

const DOWNLOADED_GREEN = "#4ade80";

type DownloadArtworkOverlayProps = {
  size: number;
  borderRadius: number;
  progress: number;
};

export function DownloadArtworkOverlay({
  size,
  borderRadius,
  progress,
}: DownloadArtworkOverlayProps) {
  const ringSize = moderateScale(30);
  const strokeWidth = moderateScale(2);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.48)",
      }}
    >
      <DownloadProgressRing
        progress={progress}
        size={ringSize}
        strokeWidth={strokeWidth}
        iconSize={moderateScale(14)}
        showIcon={false}
      />
    </View>
  );
}

export function DownloadedArtworkBadge() {
  const badgeSize = moderateScale(16);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        right: moderateScale(2),
        bottom: moderateScale(2),
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: DOWNLOADED_GREEN,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={moderateScale(10)} color="#0a0a0a" strokeWidth={3} />
    </View>
  );
}
