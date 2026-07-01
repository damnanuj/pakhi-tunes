import { useAuthStore } from "../store/authStore";
import {
  GUEST_DOWNLOAD_LIMIT,
  GUEST_FAVORITES_LIMIT,
} from "../constants/guestLimits";
import { useDownloadStore } from "src/features/Downloads/store/downloadStore";
import { useLocalFavoritesStore } from "src/features/favorites/store/localFavoritesStore";

export function isAuthenticatedUser(): boolean {
  const { user, token } = useAuthStore.getState();
  return Boolean(user && token);
}

export function getGuestDownloadCount(): number {
  const { songs, activeDownloads } = useDownloadStore.getState();
  const completedCount = Object.keys(songs).length;
  const inFlightCount = Object.values(activeDownloads).filter(
    (download) => !songs[download.songId]
  ).length;

  return completedCount + inFlightCount;
}

export function getGuestFavoriteCount(): number {
  return Object.keys(useLocalFavoritesStore.getState().favorites).length;
}

export function canGuestStartDownload(songId: string): boolean {
  if (isAuthenticatedUser()) return true;

  const store = useDownloadStore.getState();
  if (store.isDownloaded(songId) || store.activeDownloads[songId]) {
    return true;
  }

  return getGuestDownloadCount() < GUEST_DOWNLOAD_LIMIT;
}

export function canGuestAddFavorite(songId: string): boolean {
  if (isAuthenticatedUser()) return true;

  const trimmed = songId.trim();
  if (useLocalFavoritesStore.getState().favorites[trimmed]) {
    return true;
  }

  return getGuestFavoriteCount() < GUEST_FAVORITES_LIMIT;
}
