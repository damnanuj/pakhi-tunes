import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Trash2 } from "@tamagui/lucide-icons";
import { useShallow } from "zustand/react/shallow";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { useQueueContext } from "src/features/Player/context/QueueContext";
import { findSongIndex } from "src/features/Player/utils/queueHelpers";
import { playerRippleLight } from "src/features/Player/utils/ghostControlStyle";
import { PlayingArtworkIndicator } from "src/features/ArtistSongs/components/PlayingArtworkIndicator";
import type { ArtistSong } from "src/types/artistSongs.types";

const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);

interface HistorySongListItemProps {
  song: ArtistSong;
  onDelete: (songId: string) => void;
  isDeleting?: boolean;
}

function HistorySongListItem({
  song,
  onDelete,
  isDeleting = false,
}: HistorySongListItemProps) {
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

  const artistNames = song.artists.primary.map((a) => a.name).join(", ");
  const imageUrl = song.image[0]?.url ?? "";

  const isThisTrack = playbackState.isActive;
  const showLoadingOnRow =
    playbackState.isActive && playbackState.isPlaybackLoading;
  const showPlayingOnRow =
    playbackState.isActive &&
    playbackState.isPlaying &&
    !playbackState.isPlaybackLoading;

  const handlePress = useCallback(() => {
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
    playSong,
    playSongFromQueue,
    queueContext,
    song,
    togglePlayPause,
  ]);

  const handleDelete = useCallback(() => {
    onDelete(song.id);
  }, [onDelete, song.id]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${song.name} by ${artistNames}`}
      android_ripple={playerRippleLight}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(20),
        backgroundColor: pressed ? "rgba(255, 255, 255, 0.07)" : "transparent",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: ARTWORK_RADIUS,
          overflow: "hidden",
          backgroundColor: themeColors.dark.surfaceSecondary,
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            resizeMode="cover"
          />
        ) : null}
        {showLoadingOnRow ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
          >
            <ActivityIndicator color={themeColors.dark.accent} />
          </View>
        ) : showPlayingOnRow ? (
          <PlayingArtworkIndicator
            size={IMAGE_SIZE}
            borderRadius={ARTWORK_RADIUS}
          />
        ) : null}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <MyText
          numberOfLines={1}
          weight="600"
          fontSize={moderateScale(15)}
          color={themeColors.dark.onSurface}
        >
          {song.name}
        </MyText>
        <MyText
          numberOfLines={1}
          fontSize={moderateScale(13)}
          color={themeColors.dark.textMuted}
          style={{ marginTop: verticalScale(2) }}
        >
          {artistNames}
        </MyText>
      </View>

      <Pressable
        onPress={handleDelete}
        disabled={isDeleting}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${song.name} from history`}
        android_ripple={playerRippleLight}
        style={({ pressed }) => ({
          padding: scale(8),
          opacity: pressed || isDeleting ? 0.6 : 1,
        })}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={themeColors.dark.textMuted} />
        ) : (
          <Trash2 size={moderateScale(20)} color={themeColors.dark.textMuted} />
        )}
      </Pressable>
    </Pressable>
  );
}

export default memo(HistorySongListItem);
