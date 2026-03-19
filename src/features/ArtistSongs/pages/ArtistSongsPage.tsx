import { FlatList, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Stack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import ScreenHeader from "src/components/ScreenHeader";
import { useRefreshable } from "src/hooks";
import { getArtistSongs } from "src/services";
import SongListItem from "../components/SongListItem";
import ArtistProfileHeader from "../components/ArtistProfileHeader";
import ArtistSongsPageSkeleton from "../skeletons/ArtistSongsPageSkeleton";
import type { ArtistSong } from "src/types/artistSongs.types";

const ARTIST_SONGS_LIMIT = 50;

export default function ArtistSongsPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const artistName = name ?? "Artist";

  const { refreshControl } = useRefreshable({
    queryKeys: ["artistSongs", id ?? "", ARTIST_SONGS_LIMIT],
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["artistSongs", id ?? "", ARTIST_SONGS_LIMIT],
    queryFn: () => getArtistSongs(id!, { limit: ARTIST_SONGS_LIMIT }),
    enabled: !!id,
  });

  const songs = data?.data?.results ?? [];
  const artist = data?.data?.artist;

  if (isLoading) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
        <ArtistSongsPageSkeleton />
      </YStack>
    );
  }

  if (isError) {
    return (
      <YStack flex={1} bg={themeColors.dark.background}>
        <ScreenHeader showBack title={`${artistName} songs`} />
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <YStack px={scale(20)} py={verticalScale(24)} alignSelf="center">
            <MyText
              fontSize={moderateScale(14)}
              color={themeColors.dark.textMuted}
              textAlign="center"
            >
              Failed to load songs
            </MyText>
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: ArtistSong }) => (
    <SongListItem song={item} />
  );

  const listHeader = artist ? <ArtistProfileHeader artist={artist} /> : null;

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader showBack title={`${artistName} songs`} />
      <FlatList
        data={songs}
        keyExtractor={(item, index) =>
          `${item.encrypted_id ?? item.id}-${index}`
        }
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        refreshControl={refreshControl}
        contentContainerStyle={{
          paddingBottom: verticalScale(40),
        }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
