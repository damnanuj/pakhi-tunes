import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Download } from "@tamagui/lucide-icons";
import themeColors from "src/utils/theme/colors";
import { moderateScale } from "src/utils/functions/dimensions";

const DEFAULT_RING_SIZE = moderateScale(36);
const DEFAULT_RING_STROKE = moderateScale(2.5);
const DEFAULT_ICON_SIZE = moderateScale(20);

type DownloadProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  iconSize?: number;
  showIcon?: boolean;
};

export default function DownloadProgressRing({
  progress,
  size = DEFAULT_RING_SIZE,
  strokeWidth = DEFAULT_RING_STROKE,
  iconSize = DEFAULT_ICON_SIZE,
  showIcon = true,
}: DownloadProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={themeColors.dark.borderSecondary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={themeColors.dark.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showIcon ? (
        <View style={{ position: "absolute" }}>
          <Download size={iconSize} color={themeColors.dark.accent} />
        </View>
      ) : null}
    </View>
  );
}
