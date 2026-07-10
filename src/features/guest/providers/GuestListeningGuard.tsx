import { useEffect } from "react";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useGuestListeningStore } from "src/features/listening/store/guestListeningStore";

export default function GuestListeningGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuth();
  const reset = useGuestListeningStore((state) => state.reset);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      reset();
    }
  }, [isAuthenticated, isHydrated, reset]);

  return <>{children}</>;
}
