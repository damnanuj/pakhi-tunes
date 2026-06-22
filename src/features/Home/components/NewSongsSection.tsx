import { useCallback, useMemo } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import { Pause, Play } from "@tamagui/lucide-icons";
import { useShallow } from "zustand/react/shallow";
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
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { findSongIndex } from "src/features/Player/utils/queueHelpers";
import { QueueProvider } from "src/features/Player/context/QueueContext";
import { PlayingArtworkIndicator } from "src/features/ArtistSongs/components/PlayingArtworkIndicator";
import type { ArtistSong } from "src/types/artistSongs.types";
import { getNewReleaseSongs } from "src/types/newReleases.types";
import { NEW_RELEASES_DISPLAY_LIMIT_HOME_SONGS } from "src/utils/constants/newReleases";
import { getNewReleasesHomeSongsQueryOptions } from "../queries/newReleasesQuery";
import NewSongsSectionSkeleton from "../skeletons/NewSongsSectionSkeleton";

const COLUMN_WIDTH = scale(320);
const ROWS_PER_COLUMN = 3;
const IMAGE_SIZE = moderateScale(56);
const ARTWORK_RADIUS = moderateScale(8);
const ACTION_SIZE = moderateScale(40);

function NewSongRow({
  song,
  songQueue,
}: {
  song: ArtistSong;
  songQueue: ArtistSong[];
}) {
  const { playSongFromQueue, togglePlayPause } = usePlayback();
  const title = decodeHtmlEntities(song.name);
  const cover = getSongCoverUrl(song.image, "150x150");
  const artistsLine =
    song.artists?.primary?.map((a) => a.name).join(", ") ?? "";

  const playbackState = usePlayerStore(
    useShallow((s) => {
      const isActive = s.activeTrack?.id === song.id;
      if (!isActive) {
        return { isActive: false as const };
      }
      return {
        isActive: true as const,
        isPlaying: s.isPlaying,
        isPlaybackLoading: s.isPlaybackLoading,
      };
    })
  );

  const isThisTrack = playbackState.isActive;
  const showLoadingOnRow =
    playbackState.isActive && playbackState.isPlaybackLoading;
  const showPauseOnRow =
    playbackState.isActive &&
    playbackState.isPlaying &&
    !playbackState.isPlaybackLoading;

  const handlePlaySong = useCallback(() => {
    if (isThisTrack) {
      void togglePlayPause();
      return;
    }

    const index = findSongIndex(songQueue, song.id);
    if (index < 0) return;
    void playSongFromQueue(songQueue, index, {
      type: "newReleases",
      scope: "home",
    });
  }, [isThisTrack, togglePlayPause, songQueue, song.id, playSongFromQueue]);

  return (
    <Pressable
      onPress={handlePlaySong}
      android_ripple={{ color: "rgba(255, 255, 0, 0.14)", borderless: false }}
      style={({ pressed }) => ({
        width: "100%",
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(8),
        marginHorizontal: scale(-8),
        backgroundColor: pressed
          ? "rgba(255, 255, 255, 0.07)"
          : "transparent",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <XStack items="center" gap={scale(12)} width="100%">
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: ARTWORK_RADIUS,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: cover }}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
            }}
            resizeMode="cover"
          />
          {showLoadingOnRow ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: ARTWORK_RADIUS,
                backgroundColor: "rgba(0,0,0,0.48)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator
                color={themeColors.dark.accent}
                size="small"
              />
            </View>
          ) : showPauseOnRow ? (
            <PlayingArtworkIndicator
              size={IMAGE_SIZE}
              borderRadius={ARTWORK_RADIUS}
            />
          ) : null}
        </View>
        <YStack flex={1} style={{ minWidth: 0 }} justify="center" gap={verticalScale(4)}>
          <MyText
            fontSize={moderateScale(12)}
            fontWeight="600"
            color={
              isThisTrack
                ? themeColors.dark.accent
                : themeColors.dark.onSurface
            }
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
          {showLoadingOnRow ? (
            <ActivityIndicator color={themeColors.dark.accent} size="small" />
          ) : showPauseOnRow ? (
            <Pause size={moderateScale(18)} color={themeColors.dark.accent} />
          ) : (
            <Play
              size={moderateScale(18)}
              color={themeColors.dark.accent}
              fill={isThisTrack ? themeColors.dark.accent : undefined}
            />
          )}
        </XStack>
      </XStack>
    </Pressable>
  );
}

function NewSongColumn({
  songs,
  songQueue,
}: {
  songs: ArtistSong[];
  songQueue: ArtistSong[];
}) {
  return (
    <YStack width={COLUMN_WIDTH} gap={verticalScale(16)}>
      {songs.map((song) => (
        <NewSongRow key={song.id} song={song} songQueue={songQueue} />
      ))}
    </YStack>
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

  const columns = useMemo(() => {
    const chunks: ArtistSong[][] = [];
    for (let i = 0; i < displaySongs.length; i += ROWS_PER_COLUMN) {
      chunks.push(displaySongs.slice(i, i + ROWS_PER_COLUMN));
    }
    return chunks;
  }, [displaySongs]);

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
      <YStack px={scale(20)}>
        <XStack justify="space-between" items="center" mb={verticalScale(16)}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: scale(16),
            paddingRight: scale(20),
          }}
        >
          {columns.map((columnSongs, index) => (
            <NewSongColumn
              key={index}
              songs={columnSongs}
              songQueue={allSongs}
            />
          ))}
        </ScrollView>
      </YStack>
    </QueueProvider>
  );
}
