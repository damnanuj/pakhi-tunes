import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { PanResponder, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal } from "@tamagui/portal";
import { YStack } from "tamagui";
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import ProfileDownloadQualityItem from "./ProfileDownloadQualityItem";
import ProfileStreamQualityItem from "./ProfileStreamQualityItem";

const DISMISS_DRAG_THRESHOLD = verticalScale(80);
const DISMISS_VELOCITY_THRESHOLD = 0.75;
const OFFSCREEN_FALLBACK = verticalScale(320);

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.9,
};

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PreferencesSheet({ open, onOpenChange }: PreferencesSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN_FALLBACK);
  const backdropOpacity = useSharedValue(0);
  const isClosingRef = useRef(false);
  const sheetHeightRef = useRef(OFFSCREEN_FALLBACK);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    onOpenChangeRef.current(false);
  }, []);

  const animateClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    backdropOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withSpring(
      sheetHeightRef.current,
      SPRING_CONFIG,
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      }
    );
  }, [backdropOpacity, finishClose, translateY]);

  useEffect(() => {
    if (!open) return;
    isClosingRef.current = false;
    translateY.value = sheetHeightRef.current;
    backdropOpacity.value = 0;
    translateY.value = withSpring(0, SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }, [open, translateY, backdropOpacity]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          translateY.value = Math.max(0, gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldDismiss =
            gesture.dy > DISMISS_DRAG_THRESHOLD ||
            gesture.vy > DISMISS_VELOCITY_THRESHOLD;
          if (shouldDismiss) {
            animateClose();
          } else {
            translateY.value = withSpring(0, SPRING_CONFIG);
          }
        },
        onPanResponderTerminate: () => {
          translateY.value = withSpring(0, SPRING_CONFIG);
        },
      }),
    [animateClose, translateY]
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.55,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const onSheetLayout = useCallback((height: number) => {
    if (height <= 0) return;
    sheetHeightRef.current = height;
  }, []);

  useDismissOnBack(open, animateClose);

  if (!open) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View
          onLayout={(event) => onSheetLayout(event.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: Math.max(insets.bottom, verticalScale(16)) },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <YStack px={scale(20)} pb={verticalScale(12)}>
              <MyText
                fontSize={moderateScale(18)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                Preferences
              </MyText>
            </YStack>
          </View>
          <YStack px={scale(20)} gap={verticalScale(12)}>
            <ProfileStreamQualityItem />
            <ProfileDownloadQualityItem />
          </YStack>
        </Animated.View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sheet: {
    backgroundColor: themeColors.dark.surface,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: themeColors.dark.borderSecondary,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(8),
  },
});

export default memo(PreferencesSheet);
