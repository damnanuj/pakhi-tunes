import { memo, useCallback, useEffect, useMemo, useRef } from "react";
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
import { YStack } from "tamagui";
import { SongListItemSkeleton } from "src/features/ArtistSongs/skeletons/ArtistSongsPageSkeleton";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import { getSongListItemLayout } from "src/features/ArtistSongs/utils/songListItemLayout";
import { getSongListKey } from "src/features/ArtistSongs/utils/songListKeys";
import type { ArtistSong } from "src/types/artistSongs.types";
import { QueueProvider } from "../context/QueueContext";
import { useQueuePagination } from "../hooks/useQueuePagination";
import { usePlayerStore } from "../store/playerStore";
import { getQueueSourceLabel } from "../utils/queueHelpers";

const SHEET_HEIGHT_RATIO = 0.7;
const DISMISS_DRAG_THRESHOLD = verticalScale(80);
const DISMISS_VELOCITY_THRESHOLD = 0.75;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.9,
};

interface UpNextSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UpNextSheet({ open, onOpenChange }: UpNextSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;

  const queue = usePlayerStore((s) => s.queue);
  const queueSource = usePlayerStore((s) => s.queueSource);
  const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled);

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    supportsPagination,
  } = useQueuePagination({
    enabled: open,
    queueSource,
    shuffleEnabled,
  });

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

  const renderItem: ListRenderItem<ArtistSong> = useCallback(
    ({ item }) => <SongListItem song={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: ArtistSong) => getSongListKey(item),
    []
  );

  const handleEndReached = useCallback(() => {
    if (!supportsPagination || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage?.();
  }, [
    supportsPagination,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <YStack py={verticalScale(8)}>
        {Array.from({ length: 3 }, (_, i) => (
          <SongListItemSkeleton key={i} />
        ))}
      </YStack>
    );
  }, [isFetchingNextPage]);

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
            <YStack px={scale(20)} pb={verticalScale(12)} gap={verticalScale(4)}>
              <MyText
                fontSize={moderateScale(18)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                Up Next
              </MyText>
              <MyText
                fontSize={moderateScale(13)}
                weight="500"
                color={themeColors.dark.textMuted}
                numberOfLines={1}
              >
                Playing from {sourceLabel}
              </MyText>
            </YStack>
          </View>
          <QueueProvider songs={queue} source={queueSource}>
            <FlatList
              data={queue}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={
                supportsPagination ? handleEndReached : undefined
              }
              onEndReachedThreshold={supportsPagination ? 0.4 : undefined}
              ListFooterComponent={listFooter}
              initialNumToRender={12}
              maxToRenderPerBatch={8}
              windowSize={5}
              updateCellsBatchingPeriod={50}
              getItemLayout={getSongListItemLayout}
              removeClippedSubviews
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
