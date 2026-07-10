import { useCallback, useMemo, useState } from "react";
import { appToast } from "src/components/toast/appToastHelpers";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useDownload } from "src/features/Downloads/hooks/useDownload";
import type { DownloadQuality } from "src/features/Downloads/types/download.types";
import { useFavoriteStatus } from "src/features/favorites/hooks/useFavoriteStatus";
import { useLocalFavoriteSongIds } from "src/features/favorites/hooks/useLocalFavorites";
import { useToggleFavorite } from "src/features/favorites/hooks/useToggleFavorite";
import { artistSongToFavoritePayload } from "src/features/favorites/types/favorites.types";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { hasQueue, isSongInQueue } from "src/features/Player/utils/queueHelpers";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { ArtistSong } from "src/types/artistSongs.types";

export type SongOptionsDownloadStatus =
  | "idle"
  | "downloaded"
  | "downloading"
  | "failed"
  | "unavailable";

export type SongOptionsMenuActions = {
  favorite: {
    label: string;
    isFavorited: boolean;
    disabled: boolean;
    loading: boolean;
    onPress: () => void;
  };
  download: {
    label: string;
    disabled: boolean;
    loading: boolean;
    status: SongOptionsDownloadStatus;
    progress: number;
    onPress: () => void;
  };
  removeFromHistory?: {
    label: string;
    onPress: () => void;
  };
  playNext?: {
    label: string;
    onPress: () => void;
  };
  addToQueue?: {
    label: string;
    onPress: () => void;
  };
  qualityDialog: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (quality: DownloadQuality) => void;
    isSubmitting: boolean;
  };
  removeDialog: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  };
};

export function useSongOptionsActions(
  song: ArtistSong,
  menuOpen: boolean,
  options?: { onRemoveFromHistory?: () => void }
): SongOptionsMenuActions {
  const { isAuthenticated } = useAuth();
  const localSongIds = useLocalFavoriteSongIds();
  const { toggleFavorite, isPending: isFavoritePending } = useToggleFavorite();
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isSubmittingQuality, setIsSubmittingQuality] = useState(false);

  const queue = usePlayerStore((s) => s.queue);
  const queueSource = usePlayerStore((s) => s.queueSource);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const activeTrackId = usePlayerStore((s) => s.activeTrack?.id);
  const addSongToQueue = usePlayerStore((s) => s.addSongToQueue);
  const playSongNext = usePlayerStore((s) => s.playSongNext);

  const queueActive = hasQueue({ queue, queueIndex, queueSource, repeatMode: "off" });
  const isCurrentlyPlaying = activeTrackId === song.id;
  const songAlreadyInQueue = isSongInQueue(queue, song.id);
  const songTitle = useMemo(() => decodeHtmlEntities(song.name), [song.name]);

  const favoriteStatusSongId = isAuthenticated
    ? menuOpen
      ? song.id
      : undefined
    : song.id;

  const {
    isFavorited: isFavoritedFromStatus,
    isLoading: isFavoriteStatusLoading,
  } = useFavoriteStatus(favoriteStatusSongId);

  const isFavorited = isAuthenticated
    ? isFavoritedFromStatus
    : localSongIds.has(song.id);

  const {
    isDownloaded,
    isDownloading,
    isFailed,
    progress,
    startDownload,
    removeDownload,
  } = useDownload(song.id);

  const downloadStatus = useMemo((): SongOptionsDownloadStatus => {
    if (isDownloaded) return "downloaded";
    if (isDownloading) return "downloading";
    if (isFailed) return "failed";
    return "idle";
  }, [isDownloaded, isDownloading, isFailed]);

  const favoriteLabel = isFavorited
    ? "Remove from favorites"
    : "Add to favorites";

  const downloadLabel = useMemo(() => {
    switch (downloadStatus) {
      case "downloaded":
        return "Remove download";
      case "downloading":
        return `Downloading… ${Math.round(progress * 100)}%`;
      case "failed":
        return "Retry download";
      case "unavailable":
        return "Add to downloads";
      default:
        return "Add to downloads";
    }
  }, [downloadStatus, progress]);

  const handleFavoritePress = useCallback(() => {
    void toggleFavorite(artistSongToFavoritePayload(song), isFavorited);
  }, [toggleFavorite, song, isFavorited]);

  const handleDownloadPress = useCallback(() => {
    if (downloadStatus === "downloading") {
      return;
    }

    if (downloadStatus === "downloaded") {
      setRemoveDialogOpen(true);
      return;
    }

    setQualityDialogOpen(true);
  }, [downloadStatus]);

  const handleConfirmQuality = useCallback(
    async (quality: DownloadQuality) => {
      setIsSubmittingQuality(true);
      try {
        setQualityDialogOpen(false);
        await startDownload(song, quality);
      } finally {
        setIsSubmittingQuality(false);
      }
    },
    [song, startDownload]
  );

  const handleConfirmRemove = useCallback(async () => {
    setRemoveDialogOpen(false);
    await removeDownload();
  }, [removeDownload]);

  const handleRemoveFromHistory = useCallback(() => {
    options?.onRemoveFromHistory?.();
  }, [options]);

  const handleAddToQueuePress = useCallback(() => {
    addSongToQueue(song);
    appToast.addedToQueue(songTitle);
  }, [addSongToQueue, song, songTitle]);

  const handlePlayNextPress = useCallback(() => {
    playSongNext(song);
    appToast.playingNext(songTitle);
  }, [playSongNext, song, songTitle]);

  const showPlayNext = queueActive && !isCurrentlyPlaying;
  const showAddToQueue = queueActive && !isCurrentlyPlaying && !songAlreadyInQueue;

  return {
    favorite: {
      label: favoriteLabel,
      isFavorited,
      disabled: isFavoritePending || isFavoriteStatusLoading,
      loading: isFavoritePending || isFavoriteStatusLoading,
      onPress: handleFavoritePress,
    },
    download: {
      label: downloadLabel,
      disabled: downloadStatus === "downloading" || isSubmittingQuality,
      loading: isSubmittingQuality,
      status: downloadStatus,
      progress,
      onPress: handleDownloadPress,
    },
    ...(showPlayNext
      ? {
          playNext: {
            label: "Play next",
            onPress: handlePlayNextPress,
          },
        }
      : {}),
    ...(showAddToQueue
      ? {
          addToQueue: {
            label: "Add to queue",
            onPress: handleAddToQueuePress,
          },
        }
      : {}),
    ...(options?.onRemoveFromHistory
      ? {
          removeFromHistory: {
            label: "Remove from history",
            onPress: handleRemoveFromHistory,
          },
        }
      : {}),
    qualityDialog: {
      open: qualityDialogOpen,
      onOpenChange: setQualityDialogOpen,
      onConfirm: (quality) => void handleConfirmQuality(quality),
      isSubmitting: isSubmittingQuality,
    },
    removeDialog: {
      open: removeDialogOpen,
      onOpenChange: setRemoveDialogOpen,
      onConfirm: () => void handleConfirmRemove(),
    },
  };
}
