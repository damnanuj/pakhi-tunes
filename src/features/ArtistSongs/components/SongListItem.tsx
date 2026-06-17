import { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { XStack, YStack } from "tamagui";
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
import type { ArtistSong } from "src/types/artistSongs.types";
import { PlayingArtworkIndicator } from "./PlayingArtworkIndicator";

const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);
// const ROW_ACTION_ICON = moderateScale(30);

interface SongListItemProps {
  song: ArtistSong;
}

function SongListItem({ song }: SongListItemProps) {
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

  return (
    <XStack
      items="center"
      gap={scale(12)}
      py={verticalScale(12)}
      px={scale(20)}
    >
      <Pressable
        onPress={handlePlayAction}
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: scale(12),
          opacity: pressed ? 0.85 : 1,
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
          ) : null}
        </View>
        <YStack flex={1} style={{ minWidth: 0 }} justify="center">
          <MyText
            fontSize={moderateScale(14)}
            weight="600"
            color={themeColors.dark.onSurface}
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
      </Pressable>
      {/* <Pressable hitSlop={8}>
        <MoreVertical
          size={moderateScale(20)}
          color={themeColors.dark.onSurface}
        />
      </Pressable> */}
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
    </XStack>
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
  const aArtists = a.artists.primary.map((artist) => artist.name).join(",");
  const bArtists = b.artists.primary.map((artist) => artist.name).join(",");
  return aArtists === bArtists;
}

export default memo(SongListItem, songListItemPropsAreEqual);
