import type { ArtistSong, ArtistSongArtist } from "src/types/artistSongs.types";
import type { FavoriteSong } from "../types/favorites.types";

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

export function favoriteToQueueStub(favorite: FavoriteSong): ArtistSong {
  const artist = stubArtist(favorite.artist);

  return {
    id: favorite.songId,
    encrypted_id: favorite.encryptedId || "",
    name: favorite.title,
    type: "song",
    year: "",
    releaseDate: "",
    duration: 0,
    label: "",
    explicitContent: false,
    playCount: 0,
    language: "",
    hasLyrics: false,
    lyricsId: null,
    lyrics: null,
    url: "",
    copyright: "",
    album: { id: "", name: "", url: "" },
    artists: {
      primary: [artist],
      featured: [],
      all: [artist],
    },
    image: favorite.artworkUrl
      ? [{ quality: "150x150", url: favorite.artworkUrl }]
      : [],
  };
}
