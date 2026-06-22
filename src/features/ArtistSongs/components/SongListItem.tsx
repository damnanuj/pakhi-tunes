import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, View, type PressableStateCallbackType } from "react-native";
import { YStack } from "tamagui";
import {
  // CirclePlay,
  MoreVertical,
  // PauseCircle,
  // Play,
} from "@tamagui/lucide-icons";
import { useShallow } from "zustand/react/shallow";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { useQueueContext } from "src/features/Player/context/QueueContext";
import { findSongIndex } from "src/features/Player/utils/queueHelpers";
import {
  playerRippleLight,
} from "src/features/Player/utils/ghostControlStyle";
import type { ArtistSong } from "src/types/artistSongs.types";
import ConfirmDialog from "src/components/ConfirmDialog";
import DownloadQualityDialog from "src/features/Downloads/components/DownloadQualityDialog";
import {
  DownloadArtworkOverlay,
  DownloadedArtworkBadge,
} from "src/features/Downloads/components/DownloadArtworkOverlay";
import { useDownload } from "src/features/Downloads/hooks/useDownload";
import { useSongOptionsActions } from "../hooks/useSongOptionsActions";
import { PlayingArtworkIndicator } from "./PlayingArtworkIndicator";
import SongOptionsMenu, { type MenuAnchor } from "./SongOptionsMenu";

const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);
// const ROW_ACTION_ICON = moderateScale(30);

interface SongListItemProps {
  song: ArtistSong;
  onRemoveFromHistory?: () => void;
}

function SongListItem({ song, onRemoveFromHistory }: SongListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const menuTriggerRef = useRef<View>(null);
  const { playSong, playSongFromQueue, togglePlayPause } = usePlayback();
  const queueContext = useQueueContext();

  const playbackState = usePlayerStore(
    useShallow((s) => {
      const isActive = s.activeTrack?.id === song.id;
      if (!isActive) {
        return { isActive: false as const };
      }
      return {
        isActive: true as const,
        isPlaying: s.isPlaying,
        isPlaybackLoading: s.isPlaybackLoading,
      };
    })
  );

  const songName = useMemo(() => decodeHtmlEntities(song.name), [song.name]);
  const artistNames = useMemo(
    () => song.artists.primary.map((a) => a.name).join(", "),
    [song.artists.primary]
  );
  const imageUrl = useMemo(
    () => getSongCoverUrl(song.image),
    [song.image]
  );

  const isThisTrack = playbackState.isActive;
  const showLoadingOnRow =
    playbackState.isActive && playbackState.isPlaybackLoading;
  const showPauseOnRow =
    playbackState.isActive &&
    playbackState.isPlaying &&
    !playbackState.isPlaybackLoading;

  const handlePlayAction = useCallback(() => {
    if (isThisTrack) {
      void togglePlayPause();
      return;
    }

    if (queueContext) {
      const index = findSongIndex(queueContext.songs, song.id);
      if (index >= 0) {
        void playSongFromQueue(
          queueContext.songs,
          index,
          queueContext.source
        );
        return;
      }
    }

    void playSong(song);
  }, [
    isThisTrack,
    togglePlayPause,
    playSong,
    playSongFromQueue,
    queueContext,
    song,
  ]);

  const openOptionsMenu = useCallback(() => {
    menuTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  }, []);

  const songOptions = useSongOptionsActions(song, menuOpen, {
    onRemoveFromHistory,
  });
  const { isDownloaded, isDownloading, progress } = useDownload(song.id);

  const showDownloadOverlay =
    isDownloading && !showLoadingOnRow && !showPauseOnRow;
  const showDownloadedBadge =
    isDownloaded && !isDownloading && !showLoadingOnRow && !showPauseOnRow;

  return (
    <>
      <Pressable
        onPress={handlePlayAction}
        android_ripple={{ color: "rgba(255, 255, 0, 0.14)", borderless: false }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: scale(12),
          paddingVertical: verticalScale(12),
          paddingHorizontal: scale(20),
          backgroundColor: pressed
            ? "rgba(255, 255, 255, 0.07)"
            : "transparent",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: ARTWORK_RADIUS,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
            }}
            resizeMode="cover"
          />
          {showLoadingOnRow ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: ARTWORK_RADIUS,
                backgroundColor: "rgba(0,0,0,0.48)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator
                color={themeColors.dark.accent}
                size="small"
              />
            </View>
          ) : showPauseOnRow ? (
            <PlayingArtworkIndicator
              size={IMAGE_SIZE}
              borderRadius={ARTWORK_RADIUS}
            />
          ) : showDownloadOverlay ? (
            <DownloadArtworkOverlay
              size={IMAGE_SIZE}
              borderRadius={ARTWORK_RADIUS}
              progress={progress}
            />
          ) : null}
          {showDownloadedBadge ? <DownloadedArtworkBadge /> : null}
        </View>
        <YStack flex={1} style={{ minWidth: 0 }} justify="center">
          <MyText
            fontSize={moderateScale(14)}
            weight="600"
            color={
              isThisTrack
                ? themeColors.dark.accent
                : themeColors.dark.onSurface
            }
            numberOfLines={1}
          >
            {songName}
          </MyText>
          <MyText
            fontSize={moderateScale(13)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            {artistNames}
          </MyText>
        </YStack>
        <Pressable
          ref={menuTriggerRef}
          onPress={openOptionsMenu}
          accessibilityRole="button"
          accessibilityLabel="Song options"
          android_ripple={playerRippleLight}
          hitSlop={8}
          style={({ pressed }: PressableStateCallbackType) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: moderateScale(20),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed
              ? "rgba(255, 255, 255, 0.1)"
              : "transparent",
          })}
        >
          <MoreVertical
            size={moderateScale(20)}
            color={themeColors.dark.onSurface}
          />
        </Pressable>
      </Pressable>
      <SongOptionsMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        anchor={menuAnchor}
        actions={songOptions}
      />
      <DownloadQualityDialog
        open={songOptions.qualityDialog.open}
        onOpenChange={songOptions.qualityDialog.onOpenChange}
        onConfirm={songOptions.qualityDialog.onConfirm}
        isSubmitting={songOptions.qualityDialog.isSubmitting}
      />
      <ConfirmDialog
        open={songOptions.removeDialog.open}
        onOpenChange={songOptions.removeDialog.onOpenChange}
        title="Remove download?"
        message="This song will be deleted from your device. You can download it again later."
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={songOptions.removeDialog.onConfirm}
      />
      {/* <Pressable hitSlop={8} onPress={handlePlayAction}>
        {showLoadingOnRow ? (
          <View
            style={{
              width: ROW_ACTION_ICON,
              height: ROW_ACTION_ICON,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator
              color={themeColors.dark.accent}
              size="small"
            />
          </View>
        ) : isThisTrack ? (
          showPauseOnRow ? (
            <PauseCircle
              size={ROW_ACTION_ICON}
              color={themeColors.dark.accent}
            />
          ) : (
            <Play
              size={ROW_ACTION_ICON}
              color={themeColors.dark.accent}
              fill={themeColors.dark.accent}
            />
          )
        ) : (
          <CirclePlay size={ROW_ACTION_ICON} color={themeColors.dark.accent} />
        )}
      </Pressable> */}
    </>
  );
}

function songListItemPropsAreEqual(
  prev: SongListItemProps,
  next: SongListItemProps
): boolean {
  const a = prev.song;
  const b = next.song;
  if (a.id !== b.id) return false;
  if (a.name !== b.name) return false;
  if (a.image !== b.image) return false;
  if (prev.onRemoveFromHistory !== next.onRemoveFromHistory) return false;
  const aArtists = a.artists.primary.map((artist) => artist.name).join(",");
  const bArtists = b.artists.primary.map((artist) => artist.name).join(",");
  return aArtists === bArtists;
}

export default memo(SongListItem, songListItemPropsAreEqual);
