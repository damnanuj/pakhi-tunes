import type { AlbumDetail } from "src/types/albumSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";

export function getAlbumArtistLine(album: AlbumDetail): string | null {
  const fromPrimary =
    album.artists?.primary
      ?.map((artist) => decodeHtmlEntities(artist.name).trim())
      .filter(Boolean)
      .join(", ") ?? "";

  if (fromPrimary) return fromPrimary;

  const subtitle = decodeHtmlEntities(album.subtitle).trim();
  return subtitle || null;
}

export function getAlbumMetadataLine(album: AlbumDetail): string | null {
  const parts: string[] = [];

  const year = String(album.year ?? "").trim();
  if (year) parts.push(year);

  const language = decodeHtmlEntities(album.language).trim();
  if (language) {
    parts.push(`${language} Album`);
  } else {
    const type = decodeHtmlEntities(album.type).trim();
    if (type) parts.push(type);
  }

  if (parts.length > 0) return parts.join(" · ");

  const description = decodeHtmlEntities(album.description).trim();
  const artistLine = getAlbumArtistLine(album);
  if (!description) return null;
  if (!artistLine) return description;

  const normalizedDescription = description.toLowerCase();
  const normalizedArtist = artistLine.toLowerCase();
  if (normalizedDescription.includes(normalizedArtist)) return null;

  return description;
}
