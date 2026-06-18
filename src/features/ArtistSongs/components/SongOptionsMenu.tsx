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
import { Download, Heart, RefreshCw, Trash2 } from "@tamagui/lucide-icons";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { SongOptionsMenuActions } from "../hooks/useSongOptionsActions";
import SongOptionsMenuItem from "./SongOptionsMenuItem";

const MENU_ANIM_MS = 120;
const MENU_MIN_WIDTH = scale(200);
const MENU_ITEM_HEIGHT = verticalScale(44);
const MENU_PADDING_V = verticalScale(4);
const MENU_ITEM_PADDING_H = scale(12);
const MENU_ICON_SIZE = moderateScale(20);
const MENU_ITEM_GAP = scale(12);
const ANCHOR_GAP = verticalScale(6);
const SCREEN_EDGE_PADDING = scale(12);
const LABEL_CHAR_WIDTH = moderateScale(7.5);

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
  actions: SongOptionsMenuActions;
};

function estimateMenuWidth(labels: string[], windowWidth: number): number {
  const longestLabel = labels.reduce(
    (longest, label) => (label.length > longest.length ? label : longest),
    ""
  );
  const contentWidth =
    MENU_ITEM_PADDING_H * 2 +
    MENU_ICON_SIZE +
    MENU_ITEM_GAP +
    longestLabel.length * LABEL_CHAR_WIDTH;
  const maxWidth = windowWidth - SCREEN_EDGE_PADDING * 2;

  return Math.min(Math.max(contentWidth, MENU_MIN_WIDTH), maxWidth);
}

function getMenuPosition(
  anchor: MenuAnchor,
  menuWidth: number,
  menuHeight: number,
  windowWidth: number,
  windowHeight: number
): { left: number; top: number } {
  let left = anchor.x + anchor.width - menuWidth;
  left = Math.max(
    SCREEN_EDGE_PADDING,
    Math.min(left, windowWidth - menuWidth - SCREEN_EDGE_PADDING)
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
  actions,
}: SongOptionsMenuProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuHeight = MENU_ITEM_HEIGHT * 2 + MENU_PADDING_V * 2;
  const menuWidth = useMemo(
    () =>
      estimateMenuWidth(
        [actions.favorite.label, actions.download.label],
        windowWidth
      ),
    [actions.download.label, actions.favorite.label, windowWidth]
  );

  const backdropOpacity = useSharedValue(0);
  const panelOpacity = useSharedValue(0);
  const panelScale = useSharedValue(0.94);
  const isClosingRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  const pendingActionRef = useRef<(() => void) | null>(null);
  onOpenChangeRef.current = onOpenChange;

  const menuPosition = useMemo(() => {
    if (!anchor) return null;
    return getMenuPosition(
      anchor,
      menuWidth,
      menuHeight,
      windowWidth,
      windowHeight
    );
  }, [anchor, menuHeight, menuWidth, windowWidth, windowHeight]);

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    onOpenChangeRef.current(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const animateClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      pendingActionRef.current = afterClose ?? null;
      backdropOpacity.value = withTiming(0, TIMING_CONFIG);
      panelOpacity.value = withTiming(0, TIMING_CONFIG);
      panelScale.value = withTiming(0.94, TIMING_CONFIG, (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      });
    },
    [backdropOpacity, finishClose, panelOpacity, panelScale]
  );

  useEffect(() => {
    if (!open) return;
    isClosingRef.current = false;
    pendingActionRef.current = null;
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
      width: menuWidth,
    };
  }, [menuPosition, menuWidth]);

  const handleFavoritePress = useCallback(() => {
    if (actions.favorite.disabled || actions.favorite.loading) return;
    animateClose(actions.favorite.onPress);
  }, [actions.favorite, animateClose]);

  const handleDownloadPress = useCallback(() => {
    if (actions.download.disabled || actions.download.loading) return;
    animateClose(actions.download.onPress);
  }, [actions.download, animateClose]);

  const iconSize = moderateScale(20);
  const iconColor = themeColors.dark.onSurface;
  const accentColor = themeColors.dark.accent;

  const favoriteIcon = actions.favorite.isFavorited ? (
    <Heart size={iconSize} color={accentColor} fill={accentColor} />
  ) : (
    <Heart size={iconSize} color={iconColor} />
  );

  const downloadIcon = (() => {
    switch (actions.download.status) {
      case "downloaded":
        return <Trash2 size={iconSize} color="#f87171" />;
      case "failed":
        return <RefreshCw size={iconSize} color="#f87171" />;
      default:
        return <Download size={iconSize} color={iconColor} />;
    }
  })();

  if (!open || !anchor || !panelStaticStyle) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => animateClose()}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => animateClose()}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View style={[styles.panel, panelStaticStyle, panelStyle]}>
          <SongOptionsMenuItem
            icon={favoriteIcon}
            label={actions.favorite.label}
            onPress={handleFavoritePress}
            disabled={actions.favorite.disabled}
            loading={actions.favorite.loading}
          />
          <SongOptionsMenuItem
            icon={downloadIcon}
            label={actions.download.label}
            onPress={handleDownloadPress}
            disabled={actions.download.disabled}
            loading={actions.download.loading}
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
