/** Aesthetic Unsplash covers for playlists (upload later). */
export const PLAYLIST_COVER_URLS = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
] as const;

export function getRandomPlaylistCoverUrl(): string {
  const index = Math.floor(Math.random() * PLAYLIST_COVER_URLS.length);
  return PLAYLIST_COVER_URLS[index] ?? PLAYLIST_COVER_URLS[0];
}

/**
 * Cover for a playlist, falling back to a stable pick derived from its id so
 * the same playlist always renders the same image.
 */
export function getPlaylistCoverUrl(
  coverUrl: string | undefined | null,
  playlistId: string
): string {
  if (coverUrl) return coverUrl;

  let hash = 0;
  for (let i = 0; i < playlistId.length; i += 1) {
    hash = (hash * 31 + playlistId.charCodeAt(i)) % 100000;
  }
  const index = hash % PLAYLIST_COVER_URLS.length;
  return PLAYLIST_COVER_URLS[index] ?? PLAYLIST_COVER_URLS[0];
}
