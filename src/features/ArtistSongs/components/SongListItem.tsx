import { memo, useCallback } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  CirclePlay,
  MoreVertical,
  Pause,
  PauseCircle,
  Play,
} from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { usePlayback, usePlayerStore } from "src/features/Player";
import type { ArtistSong } from "src/types/artistSongs.types";
import { PlayingArtworkIndicator } from "./PlayingArtworkIndicator";

const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);
const ROW_ACTION_ICON = moderateScale(30);

interface SongListItemProps {
  song: ArtistSong;
}

function SongListItem({ song }: SongListItemProps) {
  const { playSong, togglePlayPause } = usePlayback();
  const activeId = usePlayerStore((s) => s.activeTrack?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isPlaybackLoading = usePlayerStore((s) => s.isPlaybackLoading);

  const songName = decodeHtmlEntities(song.name);
  const artistNames = song.artists.primary.map((a) => a.name).join(", ");
  const imageUrl = getSongCoverUrl(song.image);

  const isThisTrack = activeId === song.id;
  const showLoadingOnRow = isThisTrack && isPlaybackLoading;
  const showPauseOnRow = isThisTrack && isPlaying && !isPlaybackLoading;

  const handlePlayAction = useCallback(() => {
    if (isThisTrack) void togglePlayPause();
    else void playSong(song);
  }, [isThisTrack, togglePlayPause, playSong, song]);

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
      <Pressable hitSlop={8}>
        <MoreVertical
          size={moderateScale(20)}
          color={themeColors.dark.onSurface}
        />
      </Pressable>
      <Pressable hitSlop={8} onPress={handlePlayAction}>
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
      </Pressable>
    </XStack>
  );
}

export default memo(SongListItem);
