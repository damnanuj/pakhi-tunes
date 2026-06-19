export const GENRE_CARD_IMAGES: Record<string, string> = {
  romance:
    "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=400&fit=crop",
  sad: "https://images.unsplash.com/photo-1607688387751-c1e95ae09a42?w=400&h=400&fit=crop",
  rock: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
  pop: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  dance:
    "https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=400&fit=crop",
  hiphop:
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
  ghazals:
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  indie:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
  lofi: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
  retro:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
  unplugged:
    "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=400&h=400&fit=crop",
  devotional:
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=400&fit=crop",
};

const DEFAULT_GENRE_IMAGE =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop";

export function getGenreCardImageUrl(slug: string): string {
  return GENRE_CARD_IMAGES[slug] ?? DEFAULT_GENRE_IMAGE;
}
