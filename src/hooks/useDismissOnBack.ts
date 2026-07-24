import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

/**
 * When `open` is true, Android hardware back closes the overlay instead of
 * navigating the route underneath.
 */
export function useDismissOnBack(open: boolean, onDismiss: () => void) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onDismissRef.current();
        return true;
      }
    );

    return () => subscription.remove();
  }, [open]);
}
