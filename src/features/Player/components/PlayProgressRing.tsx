import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import themeColors from "src/utils/theme/colors";

type PlayProgressRingProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  onPress: () => void;
  children: React.ReactNode;
};

function PlayProgressRing({
  size,
  strokeWidth,
  progress,
  onPress,
  children,
}: PlayProgressRingProps) {
  const pad = strokeWidth / 2 + 1;
  const r = size / 2 - pad;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <View style={{ width: size, height: size }}>
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
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, styles.center]}>
          {children}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(PlayProgressRing);
