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
import { Check } from "@tamagui/lucide-icons";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import SongOptionsMenuItem from "src/features/ArtistSongs/components/SongOptionsMenuItem";
import type { MenuAnchor } from "src/features/ArtistSongs/components/SongOptionsMenu";
import type { PlaylistSongSort } from "../types/playlist.types";
import { PLAYLIST_SORT_OPTIONS } from "../constants/playlistSortOptions";

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

type PlaylistSortMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: MenuAnchor | null;
  activeSort: PlaylistSongSort;
  onSelect: (sort: PlaylistSongSort) => void;
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

export default function PlaylistSortMenu({
  open,
  onOpenChange,
  anchor,
  activeSort,
  onSelect,
}: PlaylistSortMenuProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuHeight =
    MENU_ITEM_HEIGHT * PLAYLIST_SORT_OPTIONS.length + MENU_PADDING_V * 2;
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

  const handleSelect = useCallback(
    (sort: PlaylistSongSort) => {
      animateClose(() => onSelect(sort));
    },
    [animateClose, onSelect]
  );

  const iconSize = moderateScale(20);

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
            {PLAYLIST_SORT_OPTIONS.map((option) => {
              const isActive = option.value === activeSort;
              return (
                <SongOptionsMenuItem
                  key={option.value}
                  icon={
                    isActive ? (
                      <Check size={iconSize} color={themeColors.dark.accent} />
                    ) : (
                      <View style={{ width: iconSize, height: iconSize }} />
                    )
                  }
                  label={option.label}
                  onPress={() => handleSelect(option.value)}
                />
              );
            })}
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
