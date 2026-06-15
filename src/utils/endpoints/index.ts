export const endpoints = {
  topArtists: "/top-artists",
  artistSongs: (artistId: string) => `/top-artists/${artistId}/songs`,
  newReleases: "/new-releases",
  albumSongs: (albumId: string) => `/albums/${albumId}/songs`,
  songSearch: "/songs/search",
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
} as const;
