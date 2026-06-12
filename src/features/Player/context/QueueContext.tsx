import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { QueueSource } from "../types";
import { usePlayerStore } from "../store/playerStore";
import { sourcesMatch } from "../utils/queueHelpers";

type QueueContextValue = {
  songs: ArtistSong[];
  source: QueueSource;
};

const QueueContext = createContext<QueueContextValue | null>(null);

interface QueueProviderProps {
  songs: ArtistSong[];
  source: QueueSource;
  children: ReactNode;
}

export function QueueProvider({ songs, source, children }: QueueProviderProps) {
  const syncQueueSongs = usePlayerStore((s) => s.syncQueueSongs);

  useEffect(() => {
    const state = usePlayerStore.getState();
    if (!sourcesMatch(state.queueSource, source)) return;
    syncQueueSongs(songs);
  }, [songs, source, syncQueueSongs]);

  const value = useMemo(() => ({ songs, source }), [songs, source]);

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueueContext(): QueueContextValue | null {
  return useContext(QueueContext);
}
