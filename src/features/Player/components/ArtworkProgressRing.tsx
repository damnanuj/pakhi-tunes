import { memo } from "react";
import { Image, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import themeColors from "src/utils/theme/colors";

type ArtworkProgressRingProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  artworkUrl: string;
};

/** Circular cover art with a non-interactive progress ring (full-screen player). */
function ArtworkProgressRing({
  size,
  strokeWidth,
  progress,
  artworkUrl,
}: ArtworkProgressRingProps) {
  const pad = strokeWidth / 2 + 1;
  const r = size / 2 - pad;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clamped);

  const imageR = Math.max(0, r - strokeWidth - 6);
  const innerDiameter = 2 * imageR;
  const imageOffset = (size - innerDiameter) / 2;

  const thumbAngle = (-90 + 360 * clamped) * (Math.PI / 180);
  const thumbX = cx + r * Math.cos(thumbAngle);
  const thumbY = cy + r * Math.sin(thumbAngle);

  return (
    <View
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={themeColors.dark.borderSecondary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={themeColors.dark.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {clamped > 0 && clamped < 1 ? (
          <Circle
            cx={thumbX}
            cy={thumbY}
            r={strokeWidth * 0.85}
            fill={themeColors.dark.accent}
          />
        ) : null}
      </Svg>
      <View
        style={{
          position: "absolute",
          left: imageOffset,
          top: imageOffset,
          width: innerDiameter,
          height: innerDiameter,
          borderRadius: innerDiameter / 2,
          overflow: "hidden",
        }}
        pointerEvents="none"
      >
        <Image
          source={{ uri: artworkUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

export default memo(ArtworkProgressRing);
