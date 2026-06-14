import { useEffect, useRef } from "react";
import { useInfinitePaginatedQuery } from "src/hooks/useInfinitePaginatedQuery";
import { getArtistSongsQueryOptions } from "src/features/ArtistSongs/queries/artistSongsQuery";
import { getAlbumSongsQueryOptions } from "src/features/AlbumSongs/queries/albumSongsQuery";
import { usePlayerStore } from "../store/playerStore";
import type { QueueSource } from "../types";
import {
  sourceSupportsQueuePagination,
  sourcesMatch,
} from "../utils/queueHelpers";

interface UseQueuePaginationOptions {
  enabled: boolean;
  queueSource: QueueSource | null;
  shuffleEnabled: boolean;
}

export function useQueuePagination({
  enabled,
  queueSource,
  shuffleEnabled,
}: UseQueuePaginationOptions) {
  const appendQueueSongs = usePlayerStore((s) => s.appendQueueSongs);
  const lastSyncedLengthRef = useRef(0);

  const supportsPagination =
    enabled &&
    !shuffleEnabled &&
    sourceSupportsQueuePagination(queueSource);

  const artistId =
    supportsPagination && queueSource?.type === "artist"
      ? queueSource.id
      : "";

  const albumId =
    supportsPagination && queueSource?.type === "album" ? queueSource.id : "";

  const artistQuery = useInfinitePaginatedQuery({
    ...getArtistSongsQueryOptions(artistId),
    enabled: supportsPagination && queueSource?.type === "artist",
  });

  const albumQuery = useInfinitePaginatedQuery({
    ...getAlbumSongsQueryOptions(albumId),
    enabled: supportsPagination && queueSource?.type === "album",
  });

  const isArtist = queueSource?.type === "artist";
  const isAlbum = queueSource?.type === "album";

  const itemsLength = isArtist
    ? artistQuery.items.length
    : isAlbum
      ? albumQuery.items.length
      : 0;

  const fetchNextPage = isArtist
    ? artistQuery.fetchNextPage
    : isAlbum
      ? albumQuery.fetchNextPage
      : undefined;

  const hasNextPage = isArtist
    ? artistQuery.hasNextPage
    : isAlbum
      ? albumQuery.hasNextPage
      : false;

  const isLoadingMore = isArtist
    ? artistQuery.isLoadingMore
    : isAlbum
      ? albumQuery.isLoadingMore
      : false;

  useEffect(() => {
    if (!supportsPagination || !queueSource) return;

    const state = usePlayerStore.getState();
    if (!sourcesMatch(state.queueSource, queueSource)) {
      lastSyncedLengthRef.current = 0;
      return;
    }

    if (itemsLength <= lastSyncedLengthRef.current) return;

    const items = isArtist
      ? artistQuery.items
      : isAlbum
        ? albumQuery.items
        : [];

    if (items.length > state.queue.length) {
      appendQueueSongs(items.slice(state.queue.length));
      lastSyncedLengthRef.current = items.length;
    }
  }, [
    supportsPagination,
    queueSource,
    itemsLength,
    isArtist,
    isAlbum,
    artistQuery.items,
    albumQuery.items,
    appendQueueSongs,
  ]);

  return {
    fetchNextPage: supportsPagination ? fetchNextPage : undefined,
    hasNextPage: hasNextPage ?? false,
    isLoadingMore: supportsPagination ? isLoadingMore : false,
    supportsPagination,
  };
}
