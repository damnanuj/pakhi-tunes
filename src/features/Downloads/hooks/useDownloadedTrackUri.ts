import { useMemo } from "react";
import { getDownloadedSong } from "../store/downloadStore";

export function useDownloadedTrackUri(songId: string | undefined) {
  return useMemo(() => {
    if (!songId) return null;
    return getDownloadedSong(songId)?.filePath ?? null;
  }, [songId]);
}

export function getLocalUriIfDownloaded(songId: string): string | null {
  return getDownloadedSong(songId)?.filePath ?? null;
}
