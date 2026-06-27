export const endpoints = {
  genres: "/genres",
  genreSongs: (slug: string) => `/genres/${encodeURIComponent(slug)}/songs`,
  topArtists: "/top-artists",
  artistSongs: (artistId: string) => `/top-artists/${artistId}/songs`,
  newReleases: "/new-releases",
  albumSongs: (albumId: string) => `/albums/${albumId}/songs`,
  songSearch: "/songs/search",
  songs: {
    search: "/songs/search",
    item: (id: string) => `/songs/${encodeURIComponent(id)}`,
  },
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
  },
  favorites: {
    list: "/favorites",
    bulk: "/favorites/bulk",
    item: (songId: string) => `/favorites/${encodeURIComponent(songId)}`,
    status: (songId: string) =>
      `/favorites/${encodeURIComponent(songId)}/status`,
  },
  history: {
    list: "/history",
    bulk: "/history/bulk",
    item: (songId: string) => `/history/${encodeURIComponent(songId)}`,
  },
  sessions: {
    create: "/sessions",
    nearby: "/sessions/nearby",
    me: "/sessions/me",
    item: (id: string) => `/sessions/${encodeURIComponent(id)}`,
    position: (id: string) =>
      `/sessions/${encodeURIComponent(id)}/position`,
  },
  users: {
    discoverable: "/users/me/discoverable",
  },
} as const;
