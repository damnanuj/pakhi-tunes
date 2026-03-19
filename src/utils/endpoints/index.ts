export const endpoints = {
  topArtists: "/top-artists",
  artistSongs: (artistId: string) => `/top-artists/${artistId}/songs`,
} as const;
