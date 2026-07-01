import { create } from "zustand";

export type GuestLimitFeature = "downloads" | "favorites";

const REDIRECT_BY_FEATURE: Record<GuestLimitFeature, string> = {
  downloads: "/(tabs)/library?tab=downloads",
  favorites: "/(tabs)/library?tab=favorites",
};

type GuestLimitDialogState = {
  open: boolean;
  feature: GuestLimitFeature | null;
  redirect: string;
  show: (feature: GuestLimitFeature) => void;
  hide: () => void;
};

export const useGuestLimitDialogStore = create<GuestLimitDialogState>((set) => ({
  open: false,
  feature: null,
  redirect: REDIRECT_BY_FEATURE.downloads,
  show: (feature) =>
    set({
      open: true,
      feature,
      redirect: REDIRECT_BY_FEATURE[feature],
    }),
  hide: () => set({ open: false }),
}));

export function showGuestLimitDialog(feature: GuestLimitFeature) {
  useGuestLimitDialogStore.getState().show(feature);
}
