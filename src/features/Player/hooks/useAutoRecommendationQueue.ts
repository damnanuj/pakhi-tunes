import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSongSuggestions } from "src/services";
import type { ArtistSong } from "src/types/artistSongs.types";
import { isListenerMode } from "src/features/NearbySession/store/nearbySessionStore";
import { usePlayerStore } from "../store/playerStore";
import {
  shouldAutoRecommendForQueue,
  shuffleQueueKeepingCurrent,
} from "../utils/queueHelpers";
import {
  DEFAULT_SUGGESTIONS_LIMIT,
  songSuggestionsQueryKey,
  SONG_SUGGESTIONS_STALE_MS,
} from "./useSongSuggestions";

function hasRadioQueueForSeed(
  seedId: string,
  state: {
    queue: ArtistSong[];
    queueSource: { type: string; seedSongId?: string } | null;
  }
): boolean {
  return (
    state.queueSource?.type === "recommendations" &&
    state.queueSource.seedSongId === seedId &&
    state.queue.length > 1
  );
}

/**
 * When the user plays a single song (search, notification, etc.), populate
 * Up Next with JioSaavn radio suggestions seeded by that track.
 *
 * Does not override multi-song curated queues (album / artist / genre /
 * playlist / favorites / history / newReleases).
 */
export function useAutoRecommendationQueue() {
  const queryClient = useQueryClient();
  const requestIdRef = useRef(0);
  const inFlightSeedRef = useRef<string | null>(null);

  const activeTrackId = usePlayerStore((s) => s.activeTrack?.id ?? null);
  const activeArtistSongId = usePlayerStore(
    (s) => s.activeArtistSong?.id ?? null
  );
  const queueLength = usePlayerStore((s) => s.queue.length);
  const queueSourceType = usePlayerStore((s) => s.queueSource?.type ?? null);
  const queueSourceSeedId = usePlayerStore((s) =>
    s.queueSource?.type === "recommendations"
      ? s.queueSource.seedSongId
      : null
  );

  useEffect(() => {
    if (!activeTrackId) return;
    if (isListenerMode()) return;

    const state = usePlayerStore.getState();
    if (!shouldAutoRecommendForQueue(state)) return;
    if (hasRadioQueueForSeed(activeTrackId, state)) return;
    if (inFlightSeedRef.current === activeTrackId) return;

    const seedSong: ArtistSong | null =
      state.activeArtistSong && state.activeArtistSong.id === activeTrackId
        ? state.activeArtistSong
        : (state.queue.find((s) => s.id === activeTrackId) ?? null);

    if (!seedSong) return;

    const seedId = seedSong.id;
    inFlightSeedRef.current = seedId;
    const requestId = ++requestIdRef.current;

    void (async () => {
      try {
        const suggestions = await queryClient.fetchQuery({
          queryKey: songSuggestionsQueryKey(seedId, DEFAULT_SUGGESTIONS_LIMIT),
          queryFn: () =>
            getSongSuggestions({
              songId: seedId,
              limit: DEFAULT_SUGGESTIONS_LIMIT,
            }),
          staleTime: SONG_SUGGESTIONS_STALE_MS,
        });

        if (requestId !== requestIdRef.current) return;

        const latest = usePlayerStore.getState();
        if (latest.activeTrack?.id !== seedId) return;
        if (isListenerMode()) return;
        if (!shouldAutoRecommendForQueue(latest)) return;
        if (hasRadioQueueForSeed(seedId, latest)) return;

        const uniqueSuggestions = (Array.isArray(suggestions) ? suggestions : [])
          .filter((song) => song?.id && song.id !== seedId);

        const originalQueue = [seedSong, ...uniqueSuggestions];
        if (originalQueue.length <= 1) {
          // Still mark as radio so Up Next knows the context; no more tracks yet.
          latest.setQueue([seedSong], 0, {
            type: "recommendations",
            seedSongId: seedId,
          });
          latest.setOriginalQueue([seedSong]);
          return;
        }

        const orderedQueue = latest.shuffleEnabled
          ? shuffleQueueKeepingCurrent(originalQueue, 0)
          : originalQueue;

        latest.setQueue(orderedQueue, 0, {
          type: "recommendations",
          seedSongId: seedId,
        });
        latest.setOriginalQueue(originalQueue);
      } catch {
        // Silent failure — user keeps the single playing song.
      } finally {
        if (inFlightSeedRef.current === seedId) {
          inFlightSeedRef.current = null;
        }
      }
    })();
  }, [
    activeTrackId,
    activeArtistSongId,
    queueLength,
    queueSourceType,
    queueSourceSeedId,
    queryClient,
  ]);
}
