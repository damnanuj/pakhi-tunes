export type DownloadQuality = "96kbps" | "160kbps" | "320kbps";

export type DownloadStatus = "downloading" | "paused" | "failed";

export type DownloadedSong = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  durationSec: number;
  albumName?: string;
  quality: DownloadQuality;
  filePath: string;
  fileSize: number;
  downloadedAt: number;
};

export type DownloadProgress = {
  songId: string;
  title: string;
  progress: number;
  status: DownloadStatus;
};

export const DEFAULT_DOWNLOAD_QUALITY: DownloadQuality = "320kbps";

export const DOWNLOAD_QUALITY_OPTIONS: {
  quality: DownloadQuality;
  label: string;
}[] = [
  { quality: "320kbps", label: "High" },
  { quality: "160kbps", label: "Medium" },
  { quality: "96kbps", label: "Low" },
];
