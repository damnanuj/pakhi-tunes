export type ActiveTrack = {
  id: string;
  uri: string;
  title: string;
  /** Primary artists, comma-separated */
  artist: string;
  artworkUrl: string;
  /** Seconds from API (fallback if AV duration unknown) */
  durationSec: number;
  albumName?: string;
  label?: string;
};
