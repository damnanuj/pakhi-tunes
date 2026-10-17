import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Repeat, Repeat1, Shuffle } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import ListFooterSpinner from "src/components/ListFooterSpinner";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import {
  getSongListItemLayout,
  SONG_LIST_ITEM_HEIGHT,
} from "src/features/ArtistSongs/utils/songListItemLayout";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import type { ArtistSong } from "src/types/artistSongs.types";
import { usePlayback } from "../context/PlayerContext";
import { QueueProvider } from "../context/QueueContext";
import { useQueuePagination } from "../hooks/useQueuePagination";
import { usePlayerStore } from "../store/playerStore";
import { getQueueSourceLabel, shouldShowQueueSourceLabel } from "../utils/queueHelpers";
import {
  ghostControlStyle,
  playerRippleLight,
} from "../utils/ghostControlStyle";
import { useScrollEndReached } from "src/hooks";

const SHEET_HEIGHT_RATIO = 0.7;
const DISMISS_DRAG_THRESHOLD = verticalScale(80);
const DISMISS_VELOCITY_THRESHOLD = 0.75;
const ACTIVE_ITEM_VIEW_POSITION = 0.35;
const PREFETCH_NEAR_END_THRESHOLD = 5;
const SCROLL_TO_INDEX_RETRY_MS = 100;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.9,
};

interface UpNextSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function QueueModeButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={playerRippleLight}
      style={({ pressed }) => ghostControlStyle(pressed)}
    >
      {children}
    </Pressable>
  );
}

function UpNextSheet({ open, onOpenChange }: UpNextSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;

  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const queueSource = usePlayerStore((s) => s.queueSource);
  const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const { toggleShuffle, cycleRepeatMode } = usePlayback();

  const flatListRef = useRef<FlatList<ArtistSong>>(null);
  const hasScrolledToActiveRef = useRef(false);
  const lastScrolledQueueIndexRef = useRef(-1);
  const hasPrefetchedRef = useRef(false);

  const {
    fetchNextPage: handleEndReached,
    hasNextPage,
    isLoadingMore,
    supportsPagination,
  } = useQueuePagination({
    enabled: open,
    queueSource,
    shuffleEnabled,
  });

  const { onScroll, onEndReached, resetScrollTracking } = useScrollEndReached(
    handleEndReached,
    {
      enabled: supportsPagination && hasNextPage,
      isLoadingMore,
    }
  );

  const scrollToActiveItem = useCallback(
    (animated = false) => {
      if (queueIndex < 0 || queue.length === 0) return;
      const index = Math.min(queueIndex, queue.length - 1);
      flatListRef.current?.scrollToIndex({
        index,
        animated,
        viewPosition: ACTIVE_ITEM_VIEW_POSITION,
      });
    },
    [queueIndex, queue.length]
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      const offset = SONG_LIST_ITEM_HEIGHT * info.index;
      flatListRef.current?.scrollToOffset({ offset, animated: false });
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
          viewPosition: ACTIVE_ITEM_VIEW_POSITION,
        });
      }, SCROLL_TO_INDEX_RETRY_MS);
    },
    []
  );

  useEffect(() => {
    if (!open) {
      hasScrolledToActiveRef.current = false;
      lastScrolledQueueIndexRef.current = -1;
      hasPrefetchedRef.current = false;
      return;
    }

    resetScrollTracking();
  }, [open, resetScrollTracking]);

  // Scroll to active only on drawer open or when skip next/prev changes queueIndex.
  // Do NOT re-scroll when queue.length grows from pagination.
  useEffect(() => {
    if (!open || queueIndex < 0 || queue.length === 0) return;

    const isInitialOpen = !hasScrolledToActiveRef.current;
    const queueIndexChanged =
      lastScrolledQueueIndexRef.current !== queueIndex;

    if (!isInitialOpen && !queueIndexChanged) return;

    hasScrolledToActiveRef.current = true;
    lastScrolledQueueIndexRef.current = queueIndex;

    const frame = requestAnimationFrame(() => {
      scrollToActiveItem(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [open, queueIndex, scrollToActiveItem]);

  // Prefetch once per drawer open when playing near the end of the loaded queue.
  useEffect(() => {
    if (!open || hasPrefetchedRef.current) return;
    if (!supportsPagination || !hasNextPage || isLoadingMore) return;
    if (queueIndex < 0 || queue.length === 0) return;
    if (queueIndex < queue.length - PREFETCH_NEAR_END_THRESHOLD) return;

    hasPrefetchedRef.current = true;
    handleEndReached?.();
  }, [
    open,
    queueIndex,
    queue.length,
    supportsPagination,
    hasNextPage,
    isLoadingMore,
    handleEndReached,
  ]);

  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);
  const isClosingRef = useRef(false);
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
    translateY.value = withSpring(sheetHeight, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }, [backdropOpacity, finishClose, sheetHeight, translateY]);

  useEffect(() => {
    if (!open) return;
    isClosingRef.current = false;
    translateY.value = sheetHeight;
    backdropOpacity.value = 0;
    translateY.value = withSpring(0, SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }, [open, sheetHeight, translateY, backdropOpacity]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) =>
          gs.dy > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderMove: (_, gs) => {
          translateY.value = Math.max(0, gs.dy);
        },
        onPanResponderRelease: (_, gs) => {
          const shouldDismiss =
            gs.dy > DISMISS_DRAG_THRESHOLD ||
            gs.vy > DISMISS_VELOCITY_THRESHOLD;
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

  const sourceLabel = getQueueSourceLabel(queueSource);
  const showSourceLabel = shouldShowQueueSourceLabel(queueSource);

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const listFooter = useMemo(() => {
    if (!isLoadingMore) return null;
    return <ListFooterSpinner />;
  }, [isLoadingMore]);

  if (!open || !queueSource) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              height: sheetHeight,
              paddingBottom: Math.max(insets.bottom, verticalScale(12)),
            },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <XStack
            px={scale(20)}
            pb={verticalScale(12)}
            items="center"
            gap={scale(12)}
          >
            <View style={styles.titleBlock} {...panResponder.panHandlers}>
              <YStack flex={1} gap={verticalScale(4)}>
                <MyText
                  fontSize={moderateScale(18)}
                  weight="700"
                  color={themeColors.dark.onSurface}
                >
                  Up Next
                </MyText>
                {showSourceLabel ? (
                  <MyText
                    fontSize={moderateScale(13)}
                    weight="500"
                    color={themeColors.dark.textMuted}
                    numberOfLines={1}
                  >
                    Playing from {sourceLabel}
                  </MyText>
                ) : null}
              </YStack>
            </View>
            <QueueModeButton
              onPress={toggleShuffle}
              accessibilityLabel="Shuffle upcoming songs"
            >
              <Shuffle
                size={moderateScale(20)}
                color={themeColors.dark.onSurface}
              />
            </QueueModeButton>
            <QueueModeButton
              onPress={cycleRepeatMode}
              accessibilityLabel={
                repeatMode === "one"
                  ? "Repeat one song"
                  : repeatMode === "all"
                    ? "Repeat all songs"
                    : "Repeat is off"
              }
            >
              {repeatMode === "one" ? (
                <Repeat1
                  size={moderateScale(20)}
                  color={themeColors.dark.accent}
                />
              ) : (
                <Repeat
                  size={moderateScale(20)}
                  color={
                    repeatMode === "all"
                      ? themeColors.dark.accent
                      : themeColors.dark.onSurface
                  }
                />
              )}
            </QueueModeButton>
          </XStack>
          <QueueProvider songs={queue} source={queueSource}>
            <FlatList
              ref={flatListRef}
              data={queue}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onEndReached={supportsPagination ? onEndReached : undefined}
              onEndReachedThreshold={0.4}
              onScrollToIndexFailed={onScrollToIndexFailed}
              ListFooterComponent={listFooter}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={9}
              updateCellsBatchingPeriod={50}
              getItemLayout={getSongListItemLayout}
              contentContainerStyle={{
                paddingBottom: verticalScale(12),
              }}
            />
          </QueueProvider>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
  titleBlock: {
    flex: 1,
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

export default memo(UpNextSheet);
