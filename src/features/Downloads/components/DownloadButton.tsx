import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  View,
  type PressableStateCallbackType,
  type ViewStyle,
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
import {
  ghostControlStyle,
  playerRippleLight,
} from "src/features/Player/utils/ghostControlStyle";
import {
  ensureDownloadableSong,
  hasDownloadUrls,
} from "../utils/ensureDownloadableSong";
import { useDownload } from "../hooks/useDownload";
import type { DownloadQuality } from "../types/download.types";
import DownloadQualityDialog from "./DownloadQualityDialog";

const ICON_SIZE = moderateScale(20);
const RING_SIZE = moderateScale(36);
const RING_STROKE = moderateScale(2.5);
const DOWNLOADED_GREEN = "#4ade80";

function downloadedControlStyle(pressed: boolean): ViewStyle {
  return {
    ...ghostControlStyle(pressed),
    backgroundColor: pressed
      ? "rgba(74, 222, 128, 0.2)"
      : "rgba(74, 222, 128, 0.12)",
    borderColor: pressed
      ? "rgba(74, 222, 128, 0.55)"
      : "rgba(74, 222, 128, 0.35)",
  };
}

function DownloadedStateIcon() {
  const badgeSize = moderateScale(13);

  return (
    <View
      style={{
        width: moderateScale(24),
        height: moderateScale(24),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Download size={ICON_SIZE} color={DOWNLOADED_GREEN} strokeWidth={2.25} />
      <View
        style={{
          position: "absolute",
          right: moderateScale(-1),
          bottom: moderateScale(-2),
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: DOWNLOADED_GREEN,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={moderateScale(8)} color="#0a0a0a" strokeWidth={3} />
      </View>
    </View>
  );
}

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
  const [isSubmittingQuality, setIsSubmittingQuality] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [pendingSong, setPendingSong] = useState<ArtistSong | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const activeArtistSong = usePlayerStore((s) => s.activeArtistSong);
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

  const cachedSong = useMemo((): ArtistSong | null => {
    if (queueSong) return queueSong;
    if (activeArtistSong?.id === track.id) return activeArtistSong;
    return null;
  }, [queueSong, activeArtistSong, track.id]);

  const fetchSongFromApi = useCallback(async (): Promise<ArtistSong | null> => {
    try {
      return await getSongById(track.id);
    } catch {
      Alert.alert(
        "Could not download",
        "Unable to load song details. Check your connection and try again."
      );
      return null;
    }
  }, [track.id]);

  const hydrateSongForDownload = useCallback(
    async (seed: ArtistSong | null): Promise<ArtistSong | null> => {
      if (seed && hasDownloadUrls(seed)) return seed;

      setIsLoadingSong(true);
      try {
        const song = seed ?? (await fetchSongFromApi());
        if (!song) return null;

        if (hasDownloadUrls(song)) return song;

        const full = await getSongById(song.id);
        if (!hasDownloadUrls(full)) {
          Alert.alert(
            "Could not download",
            "This song is not available for download right now."
          );
          return null;
        }

        return full;
      } catch {
        Alert.alert(
          "Could not download",
          "Unable to load song details. Check your connection and try again."
        );
        return null;
      } finally {
        setIsLoadingSong(false);
      }
    },
    [fetchSongFromApi]
  );

  const handleQualityDialogOpenChange = useCallback((open: boolean) => {
    setQualityDialogOpen(open);
    if (!open) {
      setPendingSong(null);
      setIsLoadingSong(false);
    }
  }, []);

  const handleOpenQualityDialog = useCallback(() => {
    if (isDownloading) return;

    if (isDownloaded) {
      setRemoveDialogOpen(true);
      return;
    }

    setQualityDialogOpen(true);
    setPendingSong(null);

    void hydrateSongForDownload(cachedSong).then((song) => {
      if (song) setPendingSong(song);
    });
  }, [isDownloaded, isDownloading, cachedSong, hydrateSongForDownload]);

  const handleConfirmQuality = useCallback(
    async (quality: DownloadQuality) => {
      setIsSubmittingQuality(true);
      try {
        const seed = pendingSong ?? cachedSong;
        const resolved = await hydrateSongForDownload(seed);
        if (!resolved) return;

        const song = await ensureDownloadableSong(resolved);
        setQualityDialogOpen(false);
        setPendingSong(null);
        await startDownload(song, quality);
      } finally {
        setIsSubmittingQuality(false);
      }
    },
    [pendingSong, cachedSong, hydrateSongForDownload, startDownload]
  );

  const handleRemoveConfirm = useCallback(async () => {
    setRemoveDialogOpen(false);
    await removeDownload();
  }, [removeDownload]);

  const canConfirmDownload =
    Boolean(pendingSong && hasDownloadUrls(pendingSong)) && !isLoadingSong;

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
        onPress={handleOpenQualityDialog}
        disabled={isDownloading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        android_ripple={isDownloading ? undefined : playerRippleLight}
        style={({ pressed }: PressableStateCallbackType) => {
          const controlStyle = isDownloaded
            ? downloadedControlStyle(pressed)
            : ghostControlStyle(pressed && !isDownloading);

          return controlStyle;
        }}
      >
        {isDownloading ? (
          <DownloadProgressRing progress={progress} />
        ) : isDownloaded ? (
          <DownloadedStateIcon />
        ) : isFailed ? (
          <RefreshCw size={ICON_SIZE} color="#f87171" />
        ) : (
          <Download size={ICON_SIZE} color={themeColors.dark.onSurface} />
        )}
      </Pressable>

      <DownloadQualityDialog
        open={qualityDialogOpen}
        onOpenChange={handleQualityDialogOpenChange}
        onConfirm={(quality) => void handleConfirmQuality(quality)}
        isSubmitting={isSubmittingQuality || isLoadingSong}
        confirmDisabled={!canConfirmDownload}
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
