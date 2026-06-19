import { useEffect, useRef } from "react";
import { useInfinitePaginatedQuery } from "src/hooks/useInfinitePaginatedQuery";
import { getArtistSongsQueryOptions } from "src/features/ArtistSongs/queries/artistSongsQuery";
import { getAlbumSongsQueryOptions } from "src/features/AlbumSongs/queries/albumSongsQuery";
import { getGenreSongsQueryOptions } from "src/features/Genres/queries/genreSongsQuery";
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

  const genreSlug =
    supportsPagination && queueSource?.type === "genre"
      ? queueSource.slug
      : "";

  const artistQuery = useInfinitePaginatedQuery({
    ...getArtistSongsQueryOptions(artistId),
    enabled: supportsPagination && queueSource?.type === "artist",
  });

  const albumQuery = useInfinitePaginatedQuery({
    ...getAlbumSongsQueryOptions(albumId),
    enabled: supportsPagination && queueSource?.type === "album",
  });

  const genreQuery = useInfinitePaginatedQuery({
    ...getGenreSongsQueryOptions(genreSlug),
    enabled: supportsPagination && queueSource?.type === "genre",
  });

  const isArtist = queueSource?.type === "artist";
  const isAlbum = queueSource?.type === "album";
  const isGenre = queueSource?.type === "genre";

  const itemsLength = isArtist
    ? artistQuery.items.length
    : isAlbum
      ? albumQuery.items.length
      : isGenre
        ? genreQuery.items.length
        : 0;

  const fetchNextPage = isArtist
    ? artistQuery.fetchNextPage
    : isAlbum
      ? albumQuery.fetchNextPage
      : isGenre
        ? genreQuery.fetchNextPage
        : undefined;

  const hasNextPage = isArtist
    ? artistQuery.hasNextPage
    : isAlbum
      ? albumQuery.hasNextPage
      : isGenre
        ? genreQuery.hasNextPage
        : false;

  const isLoadingMore = isArtist
    ? artistQuery.isLoadingMore
    : isAlbum
      ? albumQuery.isLoadingMore
      : isGenre
        ? genreQuery.isLoadingMore
        : false;

  const activeItems = isArtist
    ? artistQuery.items
    : isAlbum
      ? albumQuery.items
      : isGenre
        ? genreQuery.items
        : [];

  useEffect(() => {
    if (!supportsPagination || !queueSource) return;

    const state = usePlayerStore.getState();
    if (!sourcesMatch(state.queueSource, queueSource)) {
      lastSyncedLengthRef.current = 0;
      return;
    }

    if (itemsLength <= lastSyncedLengthRef.current) return;

    if (activeItems.length > state.queue.length) {
      appendQueueSongs(activeItems.slice(state.queue.length));
      lastSyncedLengthRef.current = activeItems.length;
    }
  }, [
    supportsPagination,
    queueSource,
    itemsLength,
    activeItems,
    appendQueueSongs,
  ]);

  return {
    fetchNextPage: supportsPagination ? fetchNextPage : undefined,
    hasNextPage: hasNextPage ?? false,
    isLoadingMore: supportsPagination ? isLoadingMore : false,
    supportsPagination,
  };
}
