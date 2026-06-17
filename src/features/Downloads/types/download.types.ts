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
  progress: number;
  status: DownloadStatus;
};

export const DOWNLOAD_QUALITY_OPTIONS: {
  quality: DownloadQuality;
  label: string;
  subtitle: string;
}[] = [
  { quality: "96kbps", label: "Low", subtitle: "~1 MB/min" },
  { quality: "160kbps", label: "Medium", subtitle: "~1.2 MB/min" },
  { quality: "320kbps", label: "High", subtitle: "~2.5 MB/min" },
];
