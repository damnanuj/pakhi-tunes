import { HISTORY_BULK_MAX } from "../types/history.types";
import { bulkUpsertHistory } from "./history.service";
import { useLocalHistoryStore } from "../store/localHistoryStore";

export async function syncLocalHistoryToServer(): Promise<{
  merged: number;
  skipped: number;
}> {
  const entries = useLocalHistoryStore.getState().getAll();
  if (entries.length === 0) {
    return { merged: 0, skipped: 0 };
  }

  let merged = 0;
  let skipped = 0;

  for (let i = 0; i < entries.length; i += HISTORY_BULK_MAX) {
    const chunk = entries.slice(i, i + HISTORY_BULK_MAX).map((entry) => ({
      songId: entry.songId,
      encryptedId: entry.encryptedId,
      title: entry.title,
      artist: entry.artist,
      artworkUrl: entry.artworkUrl,
      albumId: entry.albumId,
      albumName: entry.albumName,
      durationSec: entry.durationSec,
      language: entry.language,
      playedAt: new Date(entry.playedAtMs).toISOString(),
    }));

    const result = await bulkUpsertHistory(chunk);
    merged += result.merged;
    skipped += result.skipped;
  }

  useLocalHistoryStore.getState().clearAll();
  return { merged, skipped };
}
