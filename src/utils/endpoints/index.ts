export const endpoints = {
  topArtists: "/top-artists",
  artistSongs: (artistId: string) => `/top-artists/${artistId}/songs`,
  newReleases: "/new-releases",
  albumSongs: (albumId: string) => `/albums/${albumId}/songs`,
  songSearch: "/songs/search",
} as const;
