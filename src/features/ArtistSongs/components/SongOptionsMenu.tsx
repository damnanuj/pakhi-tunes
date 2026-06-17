import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Download, Heart } from "@tamagui/lucide-icons";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import SongOptionsMenuItem from "./SongOptionsMenuItem";

const MENU_ANIM_MS = 120;
const MENU_WIDTH = scale(210);
const MENU_ITEM_HEIGHT = verticalScale(44);
const MENU_PADDING_V = verticalScale(4);
const ANCHOR_GAP = verticalScale(6);
const SCREEN_EDGE_PADDING = scale(12);

const MENU_EASING = Easing.out(Easing.cubic);
const TIMING_CONFIG = {
  duration: MENU_ANIM_MS,
  easing: MENU_EASING,
} as const;

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SongOptionsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: MenuAnchor | null;
};

function getMenuPosition(
  anchor: MenuAnchor,
  menuHeight: number,
  windowWidth: number,
  windowHeight: number
): { left: number; top: number } {
  let left = anchor.x + anchor.width - MENU_WIDTH;
  left = Math.max(
    SCREEN_EDGE_PADDING,
    Math.min(left, windowWidth - MENU_WIDTH - SCREEN_EDGE_PADDING)
  );

  const belowTop = anchor.y + anchor.height + ANCHOR_GAP;
  const aboveTop = anchor.y - menuHeight - ANCHOR_GAP;
  const fitsBelow = belowTop + menuHeight <= windowHeight - SCREEN_EDGE_PADDING;
  const top = fitsBelow ? belowTop : Math.max(SCREEN_EDGE_PADDING, aboveTop);

  return { left, top };
}

export default function SongOptionsMenu({
  open,
  onOpenChange,
  anchor,
}: SongOptionsMenuProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuHeight = MENU_ITEM_HEIGHT * 2 + MENU_PADDING_V * 2;

  const backdropOpacity = useSharedValue(0);
  const panelOpacity = useSharedValue(0);
  const panelScale = useSharedValue(0.94);
  const isClosingRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const menuPosition = useMemo(() => {
    if (!anchor) return null;
    return getMenuPosition(anchor, menuHeight, windowWidth, windowHeight);
  }, [anchor, menuHeight, windowWidth, windowHeight]);

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    onOpenChangeRef.current(false);
  }, []);

  const animateClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    backdropOpacity.value = withTiming(0, TIMING_CONFIG);
    panelOpacity.value = withTiming(0, TIMING_CONFIG);
    panelScale.value = withTiming(0.94, TIMING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }, [backdropOpacity, finishClose, panelOpacity, panelScale]);

  useEffect(() => {
    if (!open) return;
    isClosingRef.current = false;
    backdropOpacity.value = 0;
    panelOpacity.value = 0;
    panelScale.value = 0.94;
    backdropOpacity.value = withTiming(1, TIMING_CONFIG);
    panelOpacity.value = withTiming(1, TIMING_CONFIG);
    panelScale.value = withTiming(1, TIMING_CONFIG);
  }, [open, backdropOpacity, panelOpacity, panelScale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.35,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
    transform: [{ scale: panelScale.value }],
  }));

  const panelStaticStyle = useMemo((): ViewStyle | null => {
    if (!menuPosition) return null;
    return {
      position: "absolute",
      left: menuPosition.left,
      top: menuPosition.top,
      width: MENU_WIDTH,
    };
  }, [menuPosition]);

  const handleItemPress = useCallback(() => {
    animateClose();
  }, [animateClose]);

  const iconSize = moderateScale(20);
  const iconColor = themeColors.dark.onSurface;

  if (!open || !anchor || !panelStaticStyle) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View style={[styles.panel, panelStaticStyle, panelStyle]}>
          <SongOptionsMenuItem
            icon={<Heart size={iconSize} color={iconColor} />}
            label="Add to favorites"
            onPress={handleItemPress}
          />
          <SongOptionsMenuItem
            icon={<Download size={iconSize} color={iconColor} />}
            label="Add to downloads"
            onPress={handleItemPress}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  panel: {
    backgroundColor: themeColors.dark.surface,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: MENU_PADDING_V,
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        }
      : { elevation: 12 }),
  },
});
