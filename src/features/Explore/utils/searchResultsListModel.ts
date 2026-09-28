import type { ArtistSong } from "src/types/artistSongs.types";
import type {
  SearchAlbumItem,
  SearchArtistItem,
  SearchPlaylistItem,
  SearchTopItem,
} from "src/types/songSearch.types";

export type SearchListRow =
  | { kind: "section"; key: string; label: string }
  | {
      kind: "entity";
      key: string;
      name: string;
      subtitle?: string;
      image: SearchArtistItem["image"];
      roundImage?: boolean;
      target: "artist" | "album" | "playlist";
      routeId: string;
      routeName?: string;
    }
  | { kind: "song"; key: string; song: ArtistSong };

export interface BuildSearchListRowsInput {
  top: SearchTopItem[];
  artists: SearchArtistItem[];
  albums: SearchAlbumItem[];
  playlists: SearchPlaylistItem[];
  songs: ArtistSong[];
}

function pushSection(rows: SearchListRow[], label: string) {
  rows.push({ kind: "section", key: `section-${label}`, label });
}

export function buildSearchListRows({
  top,
  artists,
  albums,
  playlists,
  songs,
}: BuildSearchListRowsInput): SearchListRow[] {
  const rows: SearchListRow[] = [];
  const songById = new Map(songs.map((song) => [song.id, song]));
  const topSongIds = new Set<string>();

  if (top.length > 0) {
    pushSection(rows, "Top Result");
    for (const item of top) {
      switch (item.type) {
        case "song": {
          topSongIds.add(item.id);
          const song = songById.get(item.id);
          if (song) {
            rows.push({ kind: "song", key: `top-song-${item.id}`, song });
          }
          break;
        }
        case "artist":
          rows.push({
            kind: "entity",
            key: `top-artist-${item.id}`,
            name: item.name,
            subtitle: item.subtitle,
            image: item.image,
            roundImage: true,
            target: "artist",
            routeId: item.encrypted_id || item.id,
            routeName: item.name,
          });
          break;
        case "album":
          rows.push({
            kind: "entity",
            key: `top-album-${item.id}`,
            name: item.name,
            subtitle: item.subtitle,
            image: item.image,
            target: "album",
            routeId: item.id,
          });
          break;
        case "playlist":
          rows.push({
            kind: "entity",
            key: `top-playlist-${item.id}`,
            name: item.name,
            subtitle: item.subtitle,
            image: item.image,
            target: "playlist",
            routeId: item.id,
            routeName: item.name,
          });
          break;
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    }
  }

  const featuredArtist = top.find((item) => item.type === "artist");
  const listedArtists = artists.filter(
    (artist) => !featuredArtist || featuredArtist.id !== artist.id
  );

  if (listedArtists.length > 0) {
    pushSection(rows, "Artists");
    for (const artist of listedArtists) {
      rows.push({
        kind: "entity",
        key: `artist-${artist.id}`,
        name: artist.name,
        subtitle: artist.subtitle || "Artist",
        image: artist.image,
        roundImage: true,
        target: "artist",
        routeId: artist.encrypted_id || artist.id,
        routeName: artist.name,
      });
    }
  }

  if (albums.length > 0) {
    pushSection(rows, "Albums");
    for (const album of albums) {
      rows.push({
        kind: "entity",
        key: `album-${album.id}`,
        name: album.name,
        subtitle: album.subtitle,
        image: album.image,
        target: "album",
        routeId: album.id,
      });
    }
  }

  if (playlists.length > 0) {
    pushSection(rows, "Playlists");
    for (const playlist of playlists) {
      rows.push({
        kind: "entity",
        key: `playlist-${playlist.id}`,
        name: playlist.name,
        subtitle: playlist.subtitle,
        image: playlist.image,
        target: "playlist",
        routeId: playlist.id,
        routeName: playlist.name,
      });
    }
  }

  const listSongs = songs.filter((song) => !topSongIds.has(song.id));
  if (listSongs.length > 0) {
    pushSection(rows, "Songs");
    const seenSongIds = new Set<string>();
    for (const song of listSongs) {
      if (seenSongIds.has(song.id)) continue;
      seenSongIds.add(song.id);
      rows.push({
        kind: "song",
        key: `song-${song.id}`,
        song,
      });
    }
  }

  return rows;
}
