import { useCallback } from "react";
import { Alert } from "react-native";
import type { ArtistSong } from "src/types/artistSongs.types";
import { downloadSong, removeDownloadedSong } from "../services/downloadService";
import { useDownloadStore } from "../store/downloadStore";
import type { DownloadQuality } from "../types/download.types";

export function useDownload(songId: string) {
  const isDownloaded = useDownloadStore((s) => Boolean(s.songs[songId]));
  const activeDownload = useDownloadStore((s) => s.activeDownloads[songId]);
  const downloadedSong = useDownloadStore((s) => s.songs[songId]);

  const isDownloading = activeDownload?.status === "downloading";
  const isFailed = activeDownload?.status === "failed";
  const progress = activeDownload?.progress ?? 0;

  const startDownload = useCallback(
    async (song: ArtistSong, quality: DownloadQuality) => {
      try {
        await downloadSong(song, quality);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Download failed.";
        Alert.alert("Download failed", message);
      }
    },
    []
  );

  const removeDownload = useCallback(async () => {
    await removeDownloadedSong(songId);
  }, [songId]);

  return {
    isDownloaded,
    isDownloading,
    isFailed,
    progress,
    downloadedSong,
    startDownload,
    removeDownload,
  };
}
