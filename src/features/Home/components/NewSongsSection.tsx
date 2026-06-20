import { useMemo } from "react";
import { Image, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import { Play } from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import ConnectionErrorState from "src/components/ConnectionErrorState";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { useNetwork } from "src/contexts/NetworkContext";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { findSongIndex } from "src/features/Player/utils/queueHelpers";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getNewReleaseSongs } from "src/types/newReleases.types";
import { NEW_RELEASES_DISPLAY_LIMIT_HOME_SONGS } from "src/utils/constants/newReleases";
import { getNewReleasesHomeSongsQueryOptions } from "../queries/newReleasesQuery";
import NewSongsSectionSkeleton from "../skeletons/NewSongsSectionSkeleton";

const IMAGE_SIZE = moderateScale(56);
const ACTION_SIZE = moderateScale(40);

function NewSongRow({
  song,
  songQueue,
}: {
  song: ArtistSong;
  songQueue: ArtistSong[];
}) {
  const { playSongFromQueue } = usePlayback();
  const title = decodeHtmlEntities(song.name);
  const cover = getSongCoverUrl(song.image, "150x150");
  const artistsLine =
    song.artists?.primary?.map((a) => a.name).join(", ") ?? "";

  const handlePlaySong = () => {
    const index = findSongIndex(songQueue, song.id);
    if (index < 0) return;
    void playSongFromQueue(songQueue, index, {
      type: "newReleases",
      scope: "home",
    });
  };

  return (
    <Pressable onPress={handlePlaySong}>
      <XStack items="center" gap={scale(12)} width="100%">
        <Image
          source={{ uri: cover }}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: moderateScale(8),
          }}
          resizeMode="cover"
        />
        <YStack flex={1} style={{ minWidth: 0 }} justify="center" gap={verticalScale(4)}>
          <MyText
            fontSize={moderateScale(12)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {title}
          </MyText>
          <MyText
            fontSize={moderateScale(11)}
            color={themeColors.dark.textMuted}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {artistsLine}
          </MyText>
        </YStack>
        <XStack
          width={ACTION_SIZE}
          height={ACTION_SIZE}
          rounded={ACTION_SIZE / 2}
          borderWidth={1}
          borderColor={themeColors.dark.accent}
          bg="rgba(255, 255, 0, 0.15)"
          items="center"
          justify="center"
        >
          <Play size={moderateScale(18)} color={themeColors.dark.accent} />
        </XStack>
      </XStack>
    </Pressable>
  );
}

export default function NewSongsSection() {
  const router = useRouter();
  const { isOffline } = useNetwork();
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery(
    getNewReleasesHomeSongsQueryOptions()
  );

  const allSongs = useMemo(
    () => getNewReleaseSongs(data?.data?.results ?? []),
    [data?.data?.results]
  );
  const displaySongs = useMemo(
    () => allSongs.slice(0, NEW_RELEASES_DISPLAY_LIMIT_HOME_SONGS),
    [allSongs]
  );

  const queueSource = useMemo(
    () => ({ type: "newReleases" as const, scope: "home" as const }),
    []
  );

  if (isLoading) {
    return <NewSongsSectionSkeleton />;
  }

  if (isError) {
    return (
      <ConnectionErrorState
        compact
        variant={
          isNetworkRelatedError(error, isOffline) ? "offline" : "error"
        }
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (displaySongs.length === 0) {
    return (
      <YStack px={scale(20)} py={verticalScale(8)}>
        <XStack justify="space-between" items="center" mb={verticalScale(16)}>
          <MyText
            fontSize={moderateScale(18)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
          >
            New Songs
          </MyText>
        </XStack>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.textMuted}>
          No new songs right now
        </MyText>
      </YStack>
    );
  }

  return (
    <QueueProvider songs={allSongs} source={queueSource}>
      <YStack px={scale(20)} gap={verticalScale(16)}>
        <XStack justify="space-between" items="center">
          <MyText
            fontSize={moderateScale(18)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
          >
            New Songs
          </MyText>
          <Pressable onPress={() => router.push("/home/new-songs" as never)}>
            <MyText fontSize={moderateScale(14)} color={themeColors.dark.accent}>
              See All
            </MyText>
          </Pressable>
        </XStack>
        {displaySongs.map((song) => (
          <NewSongRow key={song.id} song={song} songQueue={allSongs} />
        ))}
      </YStack>
    </QueueProvider>
  );
}
