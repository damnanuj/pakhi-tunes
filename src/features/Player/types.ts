export type ActiveTrack = {
  id: string;
  uri: string;
  title: string;
  artist: string;
  artworkUrl: string;
  /** Seconds from API (fallback if AV duration unknown) */
  durationSec: number;
};
