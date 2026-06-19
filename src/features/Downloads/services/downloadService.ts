import {
  createDownloadResumable,
  deleteAsync,
  getInfoAsync,
  type DownloadResumable,
} from "expo-file-system/legacy";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import type { ArtistSong } from "src/types/artistSongs.types";
import { useDownloadStore } from "../store/downloadStore";
import type { DownloadQuality } from "../types/download.types";
import { ensureDownloadableSong } from "../utils/ensureDownloadableSong";
import {
  ensureDownloadsDirectory,
  getDownloadFilePath,
  getDownloadUrlForQuality,
} from "../utils/storageUtils";

const activeResumables = new Map<string, DownloadResumable>();

function buildDownloadedSong(
  song: ArtistSong,
  quality: DownloadQuality,
  filePath: string,
  fileSize: number
) {
  return {
    id: song.id,
    title: decodeHtmlEntities(song.name),
    artist: song.artists.primary.map((a) => a.name).join(", "),
    artworkUrl: getSongCoverUrl(song.image),
    durationSec: song.duration,
    albumName: decodeHtmlEntities(song.album.name),
    quality,
    filePath,
    fileSize,
    downloadedAt: Date.now(),
  };
}

export async function downloadSong(
  song: ArtistSong,
  quality: DownloadQuality
): Promise<void> {
  const hydratedSong = await ensureDownloadableSong(song);
  const songId = hydratedSong.id;
  const store = useDownloadStore.getState();

  if (store.isDownloaded(songId)) {
    return;
  }

  const remoteUrl = getDownloadUrlForQuality(hydratedSong.downloadUrl, quality);
  if (!remoteUrl) {
    throw new Error(`No download URL available for ${quality}.`);
  }

  await ensureDownloadsDirectory();
  const filePath = getDownloadFilePath(songId);
  const songTitle = decodeHtmlEntities(hydratedSong.name);

  store.startDownload({
    songId,
    title: songTitle,
    progress: 0,
    status: "downloading",
  });

  const resumable = createDownloadResumable(
    remoteUrl,
    filePath,
    {},
    (progress) => {
      const total = progress.totalBytesExpectedToWrite;
      const written = progress.totalBytesWritten;
      if (total > 0) {
        useDownloadStore.getState().updateProgress(songId, written / total);
      }
    }
  );

  activeResumables.set(songId, resumable);

  try {
    const result = await resumable.downloadAsync();
    activeResumables.delete(songId);

    if (!result?.uri) {
      throw new Error("Download failed — no file was saved.");
    }

    const info = await getInfoAsync(result.uri);
    const fileSize = info.exists && "size" in info ? info.size ?? 0 : 0;

    useDownloadStore
      .getState()
      .completeDownload(
        buildDownloadedSong(hydratedSong, quality, result.uri, fileSize)
      );
  } catch (error) {
    activeResumables.delete(songId);
    useDownloadStore.getState().failDownload(songId);

    try {
      const info = await getInfoAsync(filePath);
      if (info.exists) {
        await deleteAsync(filePath, { idempotent: true });
      }
    } catch {
      /* ignore cleanup errors */
    }

    throw error;
  }
}

export async function cancelDownload(songId: string): Promise<void> {
  const resumable = activeResumables.get(songId);
  if (resumable) {
    try {
      await resumable.pauseAsync();
    } catch {
      /* ignore */
    }
    activeResumables.delete(songId);
  }

  useDownloadStore.getState().cancelDownload(songId);

  const filePath = getDownloadFilePath(songId);
  try {
    const info = await getInfoAsync(filePath);
    if (info.exists) {
      await deleteAsync(filePath, { idempotent: true });
    }
  } catch {
    /* ignore */
  }
}

export async function removeDownloadedSong(songId: string): Promise<void> {
  const downloaded = useDownloadStore.getState().getDownloadedSong(songId);
  if (!downloaded) return;

  const title = downloaded.title;

  await cancelDownload(songId);

  try {
    const info = await getInfoAsync(downloaded.filePath);
    if (info.exists) {
      await deleteAsync(downloaded.filePath, { idempotent: true });
    }
  } catch {
    /* ignore file deletion errors */
  }

  useDownloadStore.getState().removeDownload(songId, title);
}
