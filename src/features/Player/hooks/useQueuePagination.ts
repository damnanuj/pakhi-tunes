import { useEffect } from "react";
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
  const syncQueueSongs = usePlayerStore((s) => s.syncQueueSongs);

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

  const activeQuery =
    queueSource?.type === "artist"
      ? artistQuery
      : queueSource?.type === "album"
        ? albumQuery
        : null;

  const items = activeQuery?.items ?? [];

  useEffect(() => {
    if (!supportsPagination || !queueSource || !activeQuery) return;

    const state = usePlayerStore.getState();
    if (!sourcesMatch(state.queueSource, queueSource)) return;
    if (items.length > state.queue.length) {
      syncQueueSongs(items);
    }
  }, [supportsPagination, queueSource, activeQuery, items, syncQueueSongs]);

  return {
    fetchNextPage: activeQuery?.fetchNextPage,
    hasNextPage: activeQuery?.hasNextPage ?? false,
    isFetchingNextPage: activeQuery?.isFetchingNextPage ?? false,
    supportsPagination,
  };
}
