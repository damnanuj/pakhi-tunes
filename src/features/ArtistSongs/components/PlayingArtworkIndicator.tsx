import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { moderateScale, scale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

const BAR_WIDTH = moderateScale(3);
const BAR_GAP = scale(3);
const BAR_MAX_H = moderateScale(20);

const TIMINGS_MS = [340, 420, 280, 380] as const;
const DELAYS_MS = [0, 90, 45, 120] as const;

function EqualizerBar({
  delay,
  duration,
}: {
  delay: number;
  duration: number;
}) {
  const level = useSharedValue(0.35);

  useEffect(() => {
    level.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.22, {
            duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );
    // shared value ref is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per bar config
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: BAR_MAX_H * level.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        { width: BAR_WIDTH, borderRadius: BAR_WIDTH / 2 },
      ]}
    />
  );
}

type PlayingArtworkIndicatorProps = {
  /** Artwork square size (width = height) */
  size: number;
  borderRadius: number;
};

/**
 * Dark scrim + animated mini equalizer for “now playing” artwork.
 */
export function PlayingArtworkIndicator({
  size,
  borderRadius,
}: PlayingArtworkIndicatorProps) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius,
        overflow: "hidden",
      }}
      pointerEvents="none"
    >
      <View style={styles.scrim} />
      <View style={styles.barsWrap}>
        {TIMINGS_MS.map((duration, i) => (
          <EqualizerBar
            key={i}
            delay={DELAYS_MS[i]}
            duration={duration}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  barsWrap: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: BAR_GAP,
    paddingBottom: moderateScale(10),
  },
  bar: {
    backgroundColor: themeColors.dark.accent,
    opacity: 0.95,
  },
});
