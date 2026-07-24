import type { ArtistSong, ArtistSongArtist } from "src/types/artistSongs.types";
import type { PlaylistSong } from "../types/playlist.types";

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

export function playlistSongToQueueStub(song: PlaylistSong): ArtistSong {
  const artist = stubArtist(song.artist);

  return {
    id: song.songId,
    encrypted_id: song.encryptedId || "",
    name: song.title,
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
    image: song.artworkUrl
      ? [{ quality: "150x150", url: song.artworkUrl }]
      : [],
  };
}
