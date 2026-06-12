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

export type QueueSource =
  | { type: "album"; id: string; name: string }
  | { type: "newReleases" }
  | { type: "artist"; id: string; name: string };

export type RepeatMode = "off" | "one" | "all";
