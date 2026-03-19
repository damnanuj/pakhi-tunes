import { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import themeColors from "src/utils/theme/colors";

const SKELETON_COLOR = themeColors.dark.surface;

interface SkeletonPlaceholderProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonPlaceholder({
  width,
  height,
  borderRadius = 0,
  style,
}: SkeletonPlaceholderProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: SKELETON_COLOR,
          opacity,
        },
        style,
      ]}
    />
  );
}
