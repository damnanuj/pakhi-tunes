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

function trackToDownloadSeed(track: ActiveTrack): ArtistSong {
  return {
    id: track.id,
    encrypted_id: track.encryptedId ?? "",
    name: track.title,
    type: "song",
    year: "",
    releaseDate: "",
    duration: track.durationSec,
    label: track.label ?? "",
    explicitContent: false,
    playCount: 0,
    language: "",
    hasLyrics: false,
    lyricsId: null,
    lyrics: null,
    url: "",
    copyright: "",
    album: { id: "", name: track.albumName ?? "", url: "" },
    artists: {
      primary: [
        {
          id: "",
          name: track.artist,
          role: "artist",
          image: [],
          type: "artist",
          url: "",
        },
      ],
      featured: [],
      all: [],
    },
    image: track.artworkUrl
      ? [{ quality: "150x150", url: track.artworkUrl }]
      : [],
  };
}

interface DownloadButtonProps {
  track: ActiveTrack;
}

export default function DownloadButton({ track }: DownloadButtonProps) {
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isSubmittingQuality, setIsSubmittingQuality] = useState(false);

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

  const downloadSong = useMemo((): ArtistSong => {
    const queueSong = queue.find((s) => s.id === track.id);
    if (queueSong) return queueSong;
    if (activeArtistSong?.id === track.id) return activeArtistSong;
    return trackToDownloadSeed(track);
  }, [queue, activeArtistSong, track]);

  const handleOpenQualityDialog = useCallback(() => {
    if (isDownloading) return;

    if (isDownloaded) {
      setRemoveDialogOpen(true);
      return;
    }

    setQualityDialogOpen(true);
  }, [isDownloaded, isDownloading]);

  const handleConfirmQuality = useCallback(
    async (quality: DownloadQuality) => {
      setIsSubmittingQuality(true);
      try {
        setQualityDialogOpen(false);
        await startDownload(downloadSong, quality);
      } finally {
        setIsSubmittingQuality(false);
      }
    },
    [downloadSong, startDownload]
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
        onOpenChange={setQualityDialogOpen}
        onConfirm={(quality) => void handleConfirmQuality(quality)}
        isSubmitting={isSubmittingQuality}
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
