import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const springConfig = {
  damping: 20,
  stiffness: 200,
};

export default function TabScreenWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0.9);
  const scale = useSharedValue(0.98);

  useEffect(() => {
    opacity.value = withSpring(isFocused ? 1 : 0.85, springConfig);
    scale.value = withSpring(isFocused ? 1 : 0.98, springConfig);
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}
