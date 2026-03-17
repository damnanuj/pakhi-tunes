import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Text,
  View,
  LayoutChangeEvent,
  StyleSheet,
  Easing,
} from "react-native";

interface Props {
  text: string;
  textStyle?: any;
  speed?: number; // lower = faster scroll
  pause?: number; // pause duration between scrolls
}

const BackAndForthMarqueeText: React.FC<Props> = ({
  text,
  textStyle,
  speed = 50,
  pause = 1000,
}) => {
  const containerWidth = useRef(0);
  const textWidth = useRef(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const startBidirectionalScroll = () => {
    const distance = textWidth.current - containerWidth.current;

    if (distance <= 0) return;

    const duration = (distance / speed) * 1000;

    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -distance,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(pause),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(pause),
      ]).start(() => {
        animate(); // loop
      });
    };

    animate();
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
    maybeStart();
  };

  const onTextLayout = (e: LayoutChangeEvent) => {
    textWidth.current = e.nativeEvent.layout.width;
    maybeStart();
  };

  const maybeStart = () => {
    if (containerWidth.current && textWidth.current) {
      if (textWidth.current > containerWidth.current && !shouldAnimate) {
        setShouldAnimate(true);
        startBidirectionalScroll();
      }
    }
  };

  return (
    <View onLayout={onContainerLayout} style={styles.container}>
      <Animated.View
        style={{
          transform: [{ translateX: animatedValue }],
        }}
      >
        <Text onLayout={onTextLayout} style={textStyle} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
    flex: 1,
  },
});

export default BackAndForthMarqueeText;
