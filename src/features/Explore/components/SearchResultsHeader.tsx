import { useCallback } from "react";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import SongListItem from "src/features/ArtistSongs/components/SongListItem";
import SearchEntityRow from "./SearchEntityRow";
import type {
  SearchAlbumItem,
  SearchArtistItem,
  SearchPlaylistItem,
  SearchTopItem,
} from "src/types/songSearch.types";

interface SearchResultsHeaderProps {
  top: SearchTopItem[];
  artists: SearchArtistItem[];
  albums: SearchAlbumItem[];
  playlists: SearchPlaylistItem[];
  showSongsTitle: boolean;
}

function SectionTitle({ label }: { label: string }) {
  return (
    <YStack px={scale(20)} pt={verticalScale(14)} pb={verticalScale(4)}>
      <MyText
        fontSize={moderateScale(16)}
        weight="700"
        color={themeColors.dark.onSurface}
      >
        {label}
      </MyText>
    </YStack>
  );
}

export default function SearchResultsHeader({
  top,
  artists,
  albums,
  playlists,
  showSongsTitle,
}: SearchResultsHeaderProps) {
  const router = useRouter();

  const openArtist = useCallback(
    (id: string, name: string) => {
      router.push({
        pathname: "/explore/artist/[id]",
        params: { id, name },
      });
    },
    [router]
  );

  const openAlbum = useCallback(
    (id: string) => {
      router.push({
        pathname: "/explore/album/[id]",
        params: { id },
      });
    },
    [router]
  );

  const openPlaylist = useCallback(
    (id: string, name: string) => {
      router.push({
        pathname: "/explore/playlist/[id]",
        params: { id, name },
      });
    },
    [router]
  );

  const listedArtists = artists.filter((artist) => {
    const featured = top.find((item) => item.type === "artist");
    return !featured || featured.id !== artist.id;
  });

  return (
    <YStack>
      {top.length > 0 ? (
        <YStack>
          <SectionTitle label="Top Result" />
          {top.map((item) => {
            switch (item.type) {
              case "song":
                return <SongListItem key={`top-song-${item.id}`} song={item.song} />;
              case "artist":
                return (
                  <SearchEntityRow
                    key={`top-artist-${item.id}`}
                    name={item.name}
                    subtitle={item.subtitle}
                    image={item.image}
                    roundImage
                    onPress={() => openArtist(item.encrypted_id || item.id, item.name)}
                  />
                );
              case "album":
                return (
                  <SearchEntityRow
                    key={`top-album-${item.id}`}
                    name={item.name}
                    subtitle={item.subtitle}
                    image={item.image}
                    onPress={() => openAlbum(item.id)}
                  />
                );
              case "playlist":
                return (
                  <SearchEntityRow
                    key={`top-playlist-${item.id}`}
                    name={item.name}
                    subtitle={item.subtitle}
                    image={item.image}
                    onPress={() => openPlaylist(item.id, item.name)}
                  />
                );
              default: {
                const _exhaustive: never = item;
                return _exhaustive;
              }
            }
          })}
        </YStack>
      ) : null}

      {listedArtists.length > 0 ? (
        <YStack>
          <SectionTitle label="Artists" />
          {listedArtists.map((artist) => (
            <SearchEntityRow
              key={artist.id}
              name={artist.name}
              subtitle={artist.subtitle || "Artist"}
              image={artist.image}
              roundImage
              onPress={() =>
                openArtist(artist.encrypted_id || artist.id, artist.name)
              }
            />
          ))}
        </YStack>
      ) : null}

      {albums.length > 0 ? (
        <YStack>
          <SectionTitle label="Albums" />
          {albums.map((album) => (
            <SearchEntityRow
              key={album.id}
              name={album.name}
              subtitle={album.subtitle}
              image={album.image}
              onPress={() => openAlbum(album.id)}
            />
          ))}
        </YStack>
      ) : null}

      {playlists.length > 0 ? (
        <YStack>
          <SectionTitle label="Playlists" />
          {playlists.map((playlist) => (
            <SearchEntityRow
              key={playlist.id}
              name={playlist.name}
              subtitle={playlist.subtitle}
              image={playlist.image}
              onPress={() => openPlaylist(playlist.id, playlist.name)}
            />
          ))}
        </YStack>
      ) : null}

      {showSongsTitle ? <SectionTitle label="Songs" /> : null}
    </YStack>
  );
}
