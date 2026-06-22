import type { ArtistSong, ArtistSongArtist } from "src/types/artistSongs.types";
import type { HistoryEntry, LocalHistoryEntry } from "../types/history.types";

function stubArtist(name: string): ArtistSongArtist {
  return {
    id: "",
    name,
    role: "artist",
    image: [],
    type: "artist",
    url: "",
  };
}

function entryFields(
  entry: HistoryEntry | LocalHistoryEntry
): Pick<
  HistoryEntry,
  | "songId"
  | "encryptedId"
  | "title"
  | "artist"
  | "artworkUrl"
  | "albumId"
  | "albumName"
  | "durationSec"
  | "language"
> {
  if ("playedAtMs" in entry) {
    return {
      songId: entry.songId,
      encryptedId: entry.encryptedId ?? "",
      title: entry.title,
      artist: entry.artist,
      artworkUrl: entry.artworkUrl ?? "",
      albumId: entry.albumId ?? "",
      albumName: entry.albumName ?? "",
      durationSec: entry.durationSec ?? 0,
      language: entry.language ?? "",
    };
  }

  return {
    songId: entry.songId,
    encryptedId: entry.encryptedId,
    title: entry.title,
    artist: entry.artist,
    artworkUrl: entry.artworkUrl,
    albumId: entry.albumId,
    albumName: entry.albumName,
    durationSec: entry.durationSec,
    language: entry.language,
  };
}

export function historyToQueueStub(
  entry: HistoryEntry | LocalHistoryEntry
): ArtistSong {
  const fields = entryFields(entry);
  const artist = stubArtist(fields.artist);

  return {
    id: fields.songId,
    encrypted_id: fields.encryptedId || "",
    name: fields.title,
    type: "song",
    year: "",
    releaseDate: "",
    duration: fields.durationSec,
    label: "",
    explicitContent: false,
    playCount: 0,
    language: fields.language,
    hasLyrics: false,
    lyricsId: null,
    lyrics: null,
    url: "",
    copyright: "",
    album: {
      id: fields.albumId,
      name: fields.albumName,
      url: "",
    },
    artists: {
      primary: [artist],
      featured: [],
      all: [artist],
    },
    image: fields.artworkUrl
      ? [{ quality: "150x150", url: fields.artworkUrl }]
      : [],
  };
}
