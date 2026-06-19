import { memo, useCallback, useState } from "react";
import {
  Image,
  Pressable,
  View,
  type PressableStateCallbackType,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { Trash2 } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import {
  ghostControlStyle,
  playerRippleLight,
} from "src/features/Player/utils/ghostControlStyle";
import type { DownloadedSong } from "../types/download.types";
import { formatFileSize } from "../utils/storageUtils";
import { removeDownloadedSong } from "../services/downloadService";
import type { ActiveTrack } from "src/features/Player/types";

const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);

function downloadedSongToTrack(song: DownloadedSong): ActiveTrack {
  return {
    id: song.id,
    uri: song.filePath,
    title: song.title,
    artist: song.artist,
    artworkUrl: song.artworkUrl,
    durationSec: song.durationSec,
    albumName: song.albumName,
  };
}

interface DownloadSongItemProps {
  song: DownloadedSong;
}

function DownloadSongItem({ song }: DownloadSongItemProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const { playActiveTrack, togglePlayPause } = usePlayback();
  const activeTrack = usePlayerStore((s) => s.activeTrack);

  const isActive = activeTrack?.id === song.id;

  const handlePress = useCallback(() => {
    if (isActive) {
      void togglePlayPause();
      return;
    }
    void playActiveTrack(downloadedSongToTrack(song));
  }, [isActive, playActiveTrack, song, togglePlayPause]);

  const handleRemove = useCallback(() => {
    setRemoveDialogOpen(true);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    void removeDownloadedSong(song.id);
  }, [song.id]);

  return (
    <>
    <Pressable
      onPress={handlePress}
      onLongPress={handleRemove}
      accessibilityRole="button"
      accessibilityLabel={`${song.title} by ${song.artist}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        paddingVertical: verticalScale(10),
      })}
    >
      <XStack gap={scale(12)} items="center">
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: ARTWORK_RADIUS,
            overflow: "hidden",
            backgroundColor: themeColors.dark.surfaceSecondary,
          }}
        >
          <Image
            source={{ uri: song.artworkUrl }}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            resizeMode="cover"
          />
        </View>

        <YStack flex={1} gap={verticalScale(4)} style={{ minWidth: 0 }}>
          <MyText
            fontSize={moderateScale(15)}
            weight="700"
            color={
              isActive ? themeColors.dark.accent : themeColors.dark.onSurface
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {song.title}
          </MyText>
          <MyText
            fontSize={moderateScale(13)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {song.artist}
          </MyText>
          <XStack gap={scale(8)} items="center">
            <XStack
              px={scale(6)}
              py={verticalScale(2)}
              rounded={moderateScale(4)}
              bg={themeColors.dark.surfaceSecondary}
            >
              <MyText
                fontSize={moderateScale(10)}
                weight="700"
                color={themeColors.dark.textMuted}
              >
                {song.quality}
              </MyText>
            </XStack>
            <MyText
              fontSize={moderateScale(11)}
              weight="500"
              color={themeColors.dark.textMuted}
            >
              {formatFileSize(song.fileSize)}
            </MyText>
          </XStack>
        </YStack>

        <Pressable
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove download"
          android_ripple={playerRippleLight}
          style={({ pressed }: PressableStateCallbackType) => ({
            ...ghostControlStyle(pressed),
          })}
        >
          <Trash2 size={moderateScale(20)} color="#f87171" />
        </Pressable>
      </XStack>
    </Pressable>
    <ConfirmDialog
      open={removeDialogOpen}
      onOpenChange={setRemoveDialogOpen}
      title="Remove download?"
      message="This song will be deleted from your device. You can download it again later."
      confirmLabel="Remove"
      cancelLabel="Keep"
      onConfirm={handleRemoveConfirm}
    />
    </>
  );
}

export default memo(DownloadSongItem);
