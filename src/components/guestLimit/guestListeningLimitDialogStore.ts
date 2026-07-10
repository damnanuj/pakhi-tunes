import { create } from "zustand";

type GuestListeningLimitDialogState = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

export const useGuestListeningLimitDialogStore =
  create<GuestListeningLimitDialogState>((set) => ({
    open: false,
    show: () => set({ open: true }),
    hide: () => set({ open: false }),
  }));

export function showGuestListeningLimitDialog() {
  useGuestListeningLimitDialogStore.getState().show();
}
