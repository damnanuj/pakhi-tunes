import { useCallback, useEffect, useRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Download, Heart, History, ListEnd, ListMusic, ListStart, ListX, RefreshCw, Trash2 } from "@tamagui/lucide-icons";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import type { SongOptionsMenuActions } from "../hooks/useSongOptionsActions";
import SongOptionsMenuItem from "./SongOptionsMenuItem";

const MENU_ANIM_MS = 120;
const MENU_ITEM_HEIGHT = verticalScale(44);
const MENU_PADDING_V = verticalScale(4);
const MENU_PADDING_H = scale(4);
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
  actions: SongOptionsMenuActions;
};

function getMenuTop(
  anchor: MenuAnchor,
  menuHeight: number,
  windowHeight: number
): number {
  const belowTop = anchor.y + anchor.height + ANCHOR_GAP;
  const aboveTop = anchor.y - menuHeight - ANCHOR_GAP;
  const fitsBelow = belowTop + menuHeight <= windowHeight - SCREEN_EDGE_PADDING;
  return fitsBelow ? belowTop : Math.max(SCREEN_EDGE_PADDING, aboveTop);
}

export default function SongOptionsMenu({
  open,
  onOpenChange,
  anchor,
  actions,
}: SongOptionsMenuProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuItemCount =
    3 +
    (actions.playNext ? 1 : 0) +
    (actions.addToQueue ? 1 : 0) +
    (actions.removeFromQueue ? 1 : 0) +
    (actions.removeFromHistory ? 1 : 0) +
    (actions.removeFromPlaylist ? 1 : 0);
  const menuHeight = MENU_ITEM_HEIGHT * menuItemCount + MENU_PADDING_V * 2;
  const menuTop = anchor ? getMenuTop(anchor, menuHeight, windowHeight) : 0;
  const menuMaxWidth = windowWidth - SCREEN_EDGE_PADDING * 2;

  const backdropOpacity = useSharedValue(0);
  const panelOpacity = useSharedValue(0);
  const panelScale = useSharedValue(0.94);
  const isClosingRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  const pendingActionRef = useRef<(() => void) | null>(null);
  onOpenChangeRef.current = onOpenChange;

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

  useDismissOnBack(open, () => animateClose());

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

  const handleFavoritePress = useCallback(() => {
    if (actions.favorite.disabled || actions.favorite.loading) return;
    animateClose(actions.favorite.onPress);
  }, [actions.favorite, animateClose]);

  const handleDownloadPress = useCallback(() => {
    if (actions.download.disabled || actions.download.loading) return;
    animateClose(actions.download.onPress);
  }, [actions.download, animateClose]);

  const handleRemoveFromHistoryPress = useCallback(() => {
    if (!actions.removeFromHistory) return;
    animateClose(actions.removeFromHistory.onPress);
  }, [actions.removeFromHistory, animateClose]);

  const handlePlayNextPress = useCallback(() => {
    if (!actions.playNext) return;
    animateClose(actions.playNext.onPress);
  }, [actions.playNext, animateClose]);

  const handleAddToQueuePress = useCallback(() => {
    if (!actions.addToQueue) return;
    animateClose(actions.addToQueue.onPress);
  }, [actions.addToQueue, animateClose]);

  const handleRemoveFromQueuePress = useCallback(() => {
    if (!actions.removeFromQueue) return;
    animateClose(actions.removeFromQueue.onPress);
  }, [actions.removeFromQueue, animateClose]);

  const handleSaveToPlaylistPress = useCallback(() => {
    animateClose(actions.saveToPlaylist.onPress);
  }, [actions.saveToPlaylist, animateClose]);

  const handleRemoveFromPlaylistPress = useCallback(() => {
    if (!actions.removeFromPlaylist) return;
    animateClose(actions.removeFromPlaylist.onPress);
  }, [actions.removeFromPlaylist, animateClose]);

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

  if (!open || !anchor) return null;

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

        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            right: windowWidth - (anchor.x + anchor.width),
            top: menuTop,
            maxWidth: menuMaxWidth,
            alignItems: "flex-end",
          }}
        >
          <Animated.View style={[styles.panel, panelStyle]}>
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
            <SongOptionsMenuItem
              icon={<ListMusic size={iconSize} color={iconColor} />}
              label={actions.saveToPlaylist.label}
              onPress={handleSaveToPlaylistPress}
            />
            {actions.removeFromPlaylist ? (
              <SongOptionsMenuItem
                icon={<ListX size={iconSize} color="#f87171" />}
                label={actions.removeFromPlaylist.label}
                onPress={handleRemoveFromPlaylistPress}
              />
            ) : null}
            {actions.playNext ? (
              <SongOptionsMenuItem
                icon={<ListStart size={iconSize} color={iconColor} />}
                label={actions.playNext.label}
                onPress={handlePlayNextPress}
              />
            ) : null}
            {actions.addToQueue ? (
              <SongOptionsMenuItem
                icon={<ListEnd size={iconSize} color={iconColor} />}
                label={actions.addToQueue.label}
                onPress={handleAddToQueuePress}
              />
            ) : null}
            {actions.removeFromQueue ? (
              <SongOptionsMenuItem
                icon={<ListX size={iconSize} color="#f87171" />}
                label={actions.removeFromQueue.label}
                onPress={handleRemoveFromQueuePress}
              />
            ) : null}
            {actions.removeFromHistory ? (
              <SongOptionsMenuItem
                icon={<History size={iconSize} color="#f87171" />}
                label={actions.removeFromHistory.label}
                onPress={handleRemoveFromHistoryPress}
              />
            ) : null}
          </Animated.View>
        </View>
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
    alignSelf: "flex-start",
    backgroundColor: themeColors.dark.surface,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: MENU_PADDING_V,
    paddingHorizontal: MENU_PADDING_H,
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
