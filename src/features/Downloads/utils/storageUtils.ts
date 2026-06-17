import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system/legacy";
import type { DownloadedSong } from "../types/download.types";

const DOWNLOADS_DIR_NAME = "downloads";

export function getDownloadsDirectory(): string {
  if (!documentDirectory) {
    throw new Error("Document directory is not available on this device.");
  }
  return `${documentDirectory}${DOWNLOADS_DIR_NAME}/`;
}

export function getDownloadFilePath(songId: string): string {
  return `${getDownloadsDirectory()}${songId}.mp4`;
}

export async function ensureDownloadsDirectory(): Promise<string> {
  const dir = getDownloadsDirectory();
  const info = await getInfoAsync(dir);
  if (!info.exists) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getTotalDownloadSize(songs: DownloadedSong[]): number {
  return songs.reduce((sum, song) => sum + (song.fileSize || 0), 0);
}

export function getDownloadUrlForQuality(
  downloadUrl: { quality: string; url: string }[] | undefined,
  quality: string
): string | null {
  if (!downloadUrl?.length) return null;
  const hit = downloadUrl.find((d) => d.quality === quality);
  return hit?.url ?? null;
}
