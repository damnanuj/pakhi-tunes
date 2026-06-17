import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
  type PressableStateCallbackType,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Check, Download, RefreshCw } from "@tamagui/lucide-icons";
import { getSongById } from "src/services/songDetail.service";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack } from "src/features/Player/types";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import ConfirmDialog from "src/components/ConfirmDialog";
import themeColors from "src/utils/theme/colors";
import { moderateScale } from "src/utils/functions/dimensions";
import { ghostControlStyle } from "src/features/Player/utils/ghostControlStyle";
import { useDownload } from "../hooks/useDownload";
import type { DownloadQuality } from "../types/download.types";
import DownloadQualityDialog from "./DownloadQualityDialog";

const ICON_SIZE = moderateScale(20);
const RING_SIZE = moderateScale(36);
const RING_STROKE = moderateScale(2.5);

function DownloadProgressRing({ progress }: { progress: number }) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={themeColors.dark.borderSecondary}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={themeColors.dark.accent}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        <Download size={ICON_SIZE} color={themeColors.dark.accent} />
      </View>
    </View>
  );
}

interface DownloadButtonProps {
  track: ActiveTrack;
}

export default function DownloadButton({ track }: DownloadButtonProps) {
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isFetchingSong, setIsFetchingSong] = useState(false);
  const [pendingSong, setPendingSong] = useState<ArtistSong | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const {
    isDownloaded,
    isDownloading,
    isFailed,
    progress,
    startDownload,
    removeDownload,
  } = useDownload(track.id);

  const queueSong = useMemo(
    () => queue.find((s) => s.id === track.id) ?? null,
    [queue, track.id]
  );

  const resolveSong = useCallback(async (): Promise<ArtistSong | null> => {
    if (queueSong) return queueSong;
    try {
      setIsFetchingSong(true);
      const song = await getSongById(track.id);
      return song;
    } catch {
      Alert.alert(
        "Could not download",
        "Unable to load song details. Check your connection and try again."
      );
      return null;
    } finally {
      setIsFetchingSong(false);
    }
  }, [queueSong, track.id]);

  const handleOpenQualityDialog = useCallback(async () => {
    if (isDownloading || isFetchingSong) return;

    if (isDownloaded) {
      setRemoveDialogOpen(true);
      return;
    }

    if (isFailed) {
      const song = await resolveSong();
      if (!song) return;
      setPendingSong(song);
      setQualityDialogOpen(true);
      return;
    }

    const song = await resolveSong();
    if (!song) return;
    setPendingSong(song);
    setQualityDialogOpen(true);
  }, [isDownloaded, isDownloading, isFailed, isFetchingSong, resolveSong]);

  const handleConfirmQuality = useCallback(
    async (quality: DownloadQuality) => {
      const song = pendingSong ?? (await resolveSong());
      if (!song) return;
      setQualityDialogOpen(false);
      await startDownload(song, quality);
      setPendingSong(null);
    },
    [pendingSong, resolveSong, startDownload]
  );

  const handleRemoveConfirm = useCallback(async () => {
    setRemoveDialogOpen(false);
    await removeDownload();
  }, [removeDownload]);

  const accessibilityLabel = isDownloaded
    ? "Downloaded — tap to remove"
    : isDownloading
      ? `Downloading ${Math.round(progress * 100)} percent`
      : isFailed
        ? "Download failed — tap to retry"
        : "Download for offline";

  return (
    <>
      <Pressable
        onPress={() => void handleOpenQualityDialog()}
        disabled={isDownloading || isFetchingSong}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }: PressableStateCallbackType) => ({
          ...ghostControlStyle(pressed && !isDownloading),
          opacity: isFetchingSong ? 0.6 : 1,
        })}
      >
        {isFetchingSong ? (
          <ActivityIndicator
            size="small"
            color={themeColors.dark.onSurface}
            style={{ width: RING_SIZE, height: RING_SIZE }}
          />
        ) : isDownloading ? (
          <DownloadProgressRing progress={progress} />
        ) : isDownloaded ? (
          <Check size={ICON_SIZE} color="#4ade80" />
        ) : isFailed ? (
          <RefreshCw size={ICON_SIZE} color="#f87171" />
        ) : (
          <Download size={ICON_SIZE} color={themeColors.dark.onSurface} />
        )}
      </Pressable>

      <DownloadQualityDialog
        open={qualityDialogOpen}
        onOpenChange={setQualityDialogOpen}
        onConfirm={(quality) => void handleConfirmQuality(quality)}
        isSubmitting={isFetchingSong}
      />

      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove download?"
        message="This song will be deleted from your device. You can download it again later."
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={() => void handleRemoveConfirm()}
      />
    </>
  );
}
