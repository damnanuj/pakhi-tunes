import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  FavoriteSong,
  FavoriteSongPayload,
  FavoritesResponse,
} from "../types/favorites.types";
import {
  getFavoriteStatusQueryKey,
  getFavoritesInfiniteQueryKey,
} from "../queries/favoritesQuery";

export function payloadToFavoriteSong(payload: FavoriteSongPayload): FavoriteSong {
  return {
    id: payload.songId,
    songId: payload.songId,
    encryptedId: payload.encryptedId ?? "",
    title: payload.title,
    artist: payload.artist,
    artworkUrl: payload.artworkUrl ?? "",
  };
}

export function patchFavoriteStatusCache(
  queryClient: QueryClient,
  songId: string,
  isFavorited: boolean
) {
  queryClient.setQueryData(getFavoriteStatusQueryKey(songId), {
    songId,
    isFavorited,
  });
}

export function addFavoriteToListCache(
  queryClient: QueryClient,
  favorite: FavoriteSong
) {
  const queryKey = getFavoritesInfiniteQueryKey();
  queryClient.setQueryData<InfiniteData<FavoritesResponse>>(queryKey, (old) => {
    if (!old?.pages?.length) return old;

    const pages = old.pages.map((page, index) => {
      if (index !== 0) return page;

      const results = page.data.results;
      if (results.some((item) => item.songId === favorite.songId)) {
        return page;
      }

      return {
        ...page,
        data: {
          ...page.data,
          count: page.data.count + 1,
          results: [favorite, ...results],
        },
      };
    });

    return { ...old, pages };
  });
}

export function removeFavoriteFromListCache(
  queryClient: QueryClient,
  songId: string
) {
  const queryKey = getFavoritesInfiniteQueryKey();
  queryClient.setQueryData<InfiniteData<FavoritesResponse>>(queryKey, (old) => {
    if (!old?.pages?.length) return old;

    let wasPresent = false;
    const pages = old.pages.map((page) => {
      const hasSong = page.data.results.some((item) => item.songId === songId);
      if (hasSong) wasPresent = true;

      return {
        ...page,
        data: {
          ...page.data,
          results: page.data.results.filter((item) => item.songId !== songId),
        },
      };
    });

    if (!wasPresent) return old;

    return {
      ...old,
      pages: pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              data: {
                ...page.data,
                count: Math.max(0, page.data.count - 1),
              },
            }
          : page
      ),
    };
  });
}
