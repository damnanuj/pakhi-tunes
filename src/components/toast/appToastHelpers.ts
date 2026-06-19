import { useAppToastStore } from "./appToastStore";
import type { ShowAppToastInput } from "./appToast.types";

function formatDownloadMessage(title: string, progress: number): string {
  const percent = Math.round(progress * 100);
  return `Downloading "${title}"… ${percent}%`;
}

export const appToast = {
  show(input: ShowAppToastInput) {
    useAppToastStore.getState().show(input);
  },

  dismiss() {
    useAppToastStore.getState().dismiss();
  },

  dismissIfContext(contextId: string) {
    useAppToastStore.getState().dismissIfContext(contextId);
  },

  downloading(title: string, progress: number, songId: string) {
    useAppToastStore.getState().show({
      variant: "progress",
      message: formatDownloadMessage(title, progress),
      progress,
      contextId: songId,
    });
  },

  updateDownloadProgress(songId: string, progress: number, title: string) {
    useAppToastStore
      .getState()
      .updateProgress(
        songId,
        progress,
        formatDownloadMessage(title, progress)
      );
  },

  downloaded(title: string) {
    useAppToastStore.getState().show({
      variant: "success",
      message: `Downloaded "${title}"`,
      icon: "check",
    });
  },

  removedFromDownloads(title: string) {
    useAppToastStore.getState().show({
      variant: "removed",
      message: `Removed "${title}" from downloads`,
      icon: "trash",
    });
  },

  addedToFavorites(title: string) {
    useAppToastStore.getState().show({
      variant: "success",
      message: `Added "${title}" to favorites`,
      icon: "heart",
    });
  },

  removedFromFavorites(title: string) {
    useAppToastStore.getState().show({
      variant: "removed",
      message: `Removed "${title}" from favorites`,
      icon: "heartOff",
    });
  },

  welcomeBack(name: string) {
    useAppToastStore.getState().show({
      variant: "success",
      message: `Welcome back ${name}`,
      icon: "check",
    });
  },

  loggedOut(name: string) {
    useAppToastStore.getState().show({
      variant: "success",
      message: `See you soon, ${name}`,
      icon: "check",
    });
  },
};
