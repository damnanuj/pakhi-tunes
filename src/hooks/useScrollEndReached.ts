import { useCallback, useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const END_REACHED_DEBOUNCE_MS = 600;
const NEAR_BOTTOM_THRESHOLD = 400;

export interface UseScrollEndReachedOptions {
  enabled?: boolean;
  isLoadingMore?: boolean;
  /** Skip auto-fetch on mount when user has not scrolled yet. */
  skipUntilUserScrolls?: boolean;
  nearBottomThreshold?: number;
}

/**
 * Wraps FlatList scroll handlers to load more when near the bottom.
 * Uses scroll distance + onEndReached, and retries once after a page loads
 * while the user remains near the bottom.
 */
export function useScrollEndReached(
  fetchNextPage: (() => void) | undefined,
  options: UseScrollEndReachedOptions = {}
) {
  const {
    enabled = true,
    isLoadingMore = false,
    skipUntilUserScrolls = true,
    nearBottomThreshold = NEAR_BOTTOM_THRESHOLD,
  } = options;

  const hasUserScrolledRef = useRef(false);
  const lastEndReachedAtRef = useRef(0);
  const distanceFromEndRef = useRef(Number.POSITIVE_INFINITY);
  const prevIsLoadingMoreRef = useRef(isLoadingMore);
  const fetchNextPageRef = useRef(fetchNextPage);
  const enabledRef = useRef(enabled);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const nearBottomThresholdRef = useRef(nearBottomThreshold);

  fetchNextPageRef.current = fetchNextPage;
  enabledRef.current = enabled;
  isLoadingMoreRef.current = isLoadingMore;
  nearBottomThresholdRef.current = nearBottomThreshold;

  const tryLoadMore = useCallback(() => {
    if (!enabledRef.current || !fetchNextPageRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (skipUntilUserScrolls && !hasUserScrolledRef.current) return;

    const now = Date.now();
    if (now - lastEndReachedAtRef.current < END_REACHED_DEBOUNCE_MS) return;
    lastEndReachedAtRef.current = now;

    fetchNextPageRef.current();
  }, [skipUntilUserScrolls]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distanceFromEnd =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      distanceFromEndRef.current = distanceFromEnd;

      if (contentOffset.y > 0) {
        hasUserScrolledRef.current = true;
      }

      if (distanceFromEnd <= nearBottomThresholdRef.current) {
        tryLoadMore();
      }
    },
    [tryLoadMore]
  );

  const onEndReached = useCallback(() => {
    distanceFromEndRef.current = 0;
    tryLoadMore();
  }, [tryLoadMore]);

  useEffect(() => {
    const wasLoading = prevIsLoadingMoreRef.current;
    prevIsLoadingMoreRef.current = isLoadingMore;

    if (!wasLoading || isLoadingMore) return;
    if (distanceFromEndRef.current > nearBottomThresholdRef.current) return;

    tryLoadMore();
  }, [isLoadingMore, tryLoadMore]);

  const resetScrollTracking = useCallback(() => {
    hasUserScrolledRef.current = false;
    lastEndReachedAtRef.current = 0;
    distanceFromEndRef.current = Number.POSITIVE_INFINITY;
  }, []);

  return { onScroll, onEndReached, resetScrollTracking };
}
