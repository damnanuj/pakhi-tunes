import type { ArtistSongImage } from "src/types/artistSongs.types";

export function getSongCoverUrl(
  images: ArtistSongImage[],
  preferred = "500x500"
): string {
  const found = images.find((i) => i.quality === preferred);
  return (
    found?.url ??
    images.find((i) => i.quality === "150x150")?.url ??
    images[0]?.url ??
    ""
  );
}
