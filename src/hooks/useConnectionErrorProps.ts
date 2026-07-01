import { useMemo } from "react";

export function useConnectionErrorProps(options: {
  isOffline: boolean;
  refetch: () => void | Promise<unknown>;
  isFetching: boolean;
}) {
  const { isOffline, refetch, isFetching } = options;

  return useMemo(
    () => ({
      variant: isOffline ? ("offline" as const) : ("error" as const),
      onRetry: isOffline ? undefined : () => void refetch(),
      isRetrying: isFetching,
    }),
    [isOffline, refetch, isFetching]
  );
}
