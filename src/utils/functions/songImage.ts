import type { ArtistSongImage } from "src/types/artistSongs.types";

export function getSongCoverUrl(
  images: ArtistSongImage[],
  preferred = "150x150"
): string {
  const found = images.find((i) => i.quality === preferred);
  return (
    found?.url ??
    images.find((i) => i.quality === "500x500")?.url ??
    images[0]?.url ??
    ""
  );
}
