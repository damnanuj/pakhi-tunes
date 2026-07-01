import { useRouter } from "expo-router";
import ConfirmDialog from "src/components/ConfirmDialog";
import {
  GUEST_DOWNLOAD_LIMIT,
  GUEST_FAVORITES_LIMIT,
} from "src/features/auth/constants/guestLimits";
import { useGuestLimitDialogStore } from "./guestLimitDialogStore";

const COPY = {
  downloads: {
    message: `You've reached the guest limit of ${GUEST_DOWNLOAD_LIMIT} downloads. Sign in to download more songs. Your current downloads will not be lost.`,
  },
  favorites: {
    message: `You've reached the guest limit of ${GUEST_FAVORITES_LIMIT} favourites. Sign in to save more. Your current favourites will not be lost.`,
  },
} as const;

export default function GuestLimitDialog() {
  const router = useRouter();
  const open = useGuestLimitDialogStore((s) => s.open);
  const feature = useGuestLimitDialogStore((s) => s.feature);
  const redirect = useGuestLimitDialogStore((s) => s.redirect);
  const hide = useGuestLimitDialogStore((s) => s.hide);

  if (!feature) {
    return null;
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) hide();
      }}
      title="Guest limit reached"
      message={COPY[feature].message}
      confirmLabel="Sign in"
      cancelLabel="Not now"
      onConfirm={() => {
        hide();
        router.push({
          pathname: "/auth",
          params: {
            mode: "signin",
            redirect,
          },
        });
      }}
    />
  );
}
