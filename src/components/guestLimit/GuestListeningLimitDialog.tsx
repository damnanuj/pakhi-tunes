import { useRouter } from "expo-router";
import ConfirmDialog from "src/components/ConfirmDialog";
import { GUEST_LISTENING_LIMIT_MS } from "src/features/auth/constants/guestLimits";
import { useGuestListeningLimitDialogStore } from "./guestListeningLimitDialogStore";

const LIMIT_MINUTES = Math.round(GUEST_LISTENING_LIMIT_MS / 60_000);

export default function GuestListeningLimitDialog() {
  const router = useRouter();
  const open = useGuestListeningLimitDialogStore((state) => state.open);
  const hide = useGuestListeningLimitDialogStore((state) => state.hide);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) hide();
      }}
      title="Guest listening limit reached"
      message={`You've exhausted ${LIMIT_MINUTES} minutes of guest plays. Please sign in to continue listening unlimitedly.`}
      confirmLabel="Sign in"
      cancelLabel="Not now"
      onConfirm={() => {
        hide();
        router.push({
          pathname: "/auth",
          params: {
            mode: "signin",
            redirect: "/(tabs)/home",
          },
        });
      }}
    />
  );
}
