import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
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
import { Plus } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { ArtistSong } from "src/types/artistSongs.types";
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import type { PlaylistListItem } from "../types/playlist.types";
import { useSaveToPlaylist } from "../hooks/useSaveToPlaylist";
import SaveToPlaylistItem from "./SaveToPlaylistItem";
import NewPlaylistDialog from "./NewPlaylistDialog";
import SaveToPlaylistListSkeleton from "../skeletons/SaveToPlaylistListSkeleton";

const SHEET_HEIGHT_RATIO = 0.65;
const DISMISS_DRAG_THRESHOLD = verticalScale(80);
const DISMISS_VELOCITY_THRESHOLD = 0.75;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.9,
};

interface SaveToPlaylistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: ArtistSong | null;
}

function SaveToPlaylistSheet({
  open,
  onOpenChange,
  song,
}: SaveToPlaylistSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;

  const save = useSaveToPlaylist(song, open);

  useEffect(() => {
    if (!open) {
      // Clear ticks only — keep dialog open when transitioning to New Playlist
      save.clearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  useDismissOnBack(open, animateClose);

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

  const renderItem: ListRenderItem<PlaylistListItem> = useCallback(
    ({ item }) => (
      <SaveToPlaylistItem
        id={item.id}
        name={item.name}
        coverUrl={item.coverUrl}
        songCount={item.songCount}
        selected={save.selectedIds.has(item.id)}
        onToggle={save.togglePlaylist}
      />
    ),
    [save.selectedIds, save.togglePlaylist]
  );

  const keyExtractor = useCallback((item: PlaylistListItem) => item.id, []);

  const handleDone = useCallback(async () => {
    await save.handleDone();
    animateClose();
  }, [animateClose, save]);

  const handleCreate = useCallback(
    async (name: string, coverUrl: string) => {
      await save.handleCreatePlaylist(name, coverUrl);
    },
    [save]
  );

  const handleOpenNewPlaylist = useCallback(() => {
    save.openNewPlaylistDialog();
    animateClose();
  }, [animateClose, save]);

  if (!song) return null;
  if (!open && !save.dialogOpen) return null;

  return (
    <>
      {open ? (
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
                <XStack
                  px={scale(20)}
                  pb={verticalScale(12)}
                  items="center"
                  justify="space-between"
                >
                  <MyText
                    fontSize={moderateScale(18)}
                    weight="700"
                    color={themeColors.dark.onSurface}
                  >
                    Save to Playlist
                  </MyText>
                  <Pressable
                    onPress={handleOpenNewPlaylist}
                    hitSlop={8}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: scale(4),
                      opacity: pressed ? 0.7 : 1,
                      paddingVertical: verticalScale(4),
                      paddingHorizontal: scale(8),
                      borderRadius: moderateScale(16),
                      backgroundColor: pressed
                        ? "rgba(255,255,0,0.12)"
                        : "transparent",
                    })}
                  >
                    <Plus
                      size={moderateScale(16)}
                      color={themeColors.dark.accent}
                    />
                    <MyText
                      fontSize={moderateScale(13)}
                      weight="700"
                      color={themeColors.dark.accent}
                    >
                      New Playlist
                    </MyText>
                  </Pressable>
                </XStack>
              </View>

              {save.isLoading ? (
                <SaveToPlaylistListSkeleton />
              ) : save.playlists.length === 0 ? (
                <YStack
                  flex={1}
                  items="center"
                  justify="center"
                  px={scale(32)}
                  gap={verticalScale(8)}
                >
                  <MyText
                    fontSize={moderateScale(15)}
                    weight="600"
                    color={themeColors.dark.onSurface}
                    textAlign="center"
                  >
                    No playlists yet
                  </MyText>
                  <MyText
                    fontSize={moderateScale(13)}
                    weight="400"
                    color={themeColors.dark.textMuted}
                    textAlign="center"
                  >
                    Tap + New Playlist to create one
                  </MyText>
                </YStack>
              ) : (
                <FlatList
                  data={save.playlists}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  extraData={save.selectedIds}
                  contentContainerStyle={{ paddingBottom: verticalScale(8) }}
                />
              )}

              <XStack
                px={scale(20)}
                pt={verticalScale(8)}
                gap={scale(12)}
                borderTopWidth={1}
                borderTopColor={themeColors.dark.borderSecondary}
              >
                <Pressable
                  onPress={animateClose}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: verticalScale(14),
                    borderRadius: moderateScale(12),
                    backgroundColor: pressed
                      ? "rgba(255,255,255,0.12)"
                      : themeColors.dark.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <MyText
                    fontSize={moderateScale(15)}
                    weight="600"
                    color={themeColors.dark.onSurface}
                  >
                    Cancel
                  </MyText>
                </Pressable>
                <Pressable
                  onPress={() => void handleDone()}
                  disabled={!save.canSubmit}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: verticalScale(14),
                    borderRadius: moderateScale(12),
                    backgroundColor: save.canSubmit
                      ? pressed
                        ? "rgba(255,255,0,0.85)"
                        : themeColors.dark.accent
                      : themeColors.dark.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: save.canSubmit ? 1 : 0.5,
                  })}
                >
                  {save.isSaving ? (
                    <ActivityIndicator color={themeColors.dark.onAccent} />
                  ) : (
                    <MyText
                      fontSize={moderateScale(15)}
                      weight="700"
                      color={
                        save.canSubmit
                          ? themeColors.dark.onAccent
                          : themeColors.dark.textMuted
                      }
                    >
                      Done
                    </MyText>
                  )}
                </Pressable>
              </XStack>
            </Animated.View>
          </View>
        </Modal>
      ) : null}

      <NewPlaylistDialog
        open={save.dialogOpen}
        onOpenChange={save.setDialogOpen}
        onCreate={handleCreate}
        isSubmitting={save.isCreating}
      />
    </>
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

export default memo(SaveToPlaylistSheet);
