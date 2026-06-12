import { useMemo } from "react";
import { ScrollView, Image, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import { ChevronRight, Play } from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { getNewReleases } from "src/services";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { findSongIndex } from "src/features/Player/utils/queueHelpers";
import type { ArtistSong } from "src/types/artistSongs.types";
import {
  getNewReleaseSongs,
  isNewReleaseAlbum,
  type NewReleaseListItem,
} from "src/types/newReleases.types";
import NewReleasesSectionSkeleton from "../skeletons/NewReleasesSectionSkeleton";
import {
  NEW_RELEASES_DISPLAY_LIMIT_HOME,
  NEW_RELEASES_QUEUE_FETCH_LIMIT,
} from "src/utils/constants/newReleases";

const COLUMN_WIDTH = scale(320);
const IMAGE_SIZE = moderateScale(56);
const ACTION_SIZE = moderateScale(40);

function TypeBadge({ kind }: { kind: "song" | "album" }) {
  const isSong = kind === "song";
  return (
    <XStack
      px={scale(5)}
      py={verticalScale(1)}
      rounded={moderateScale(4)}
      borderWidth={1}
      borderColor={
        isSong ? themeColors.dark.accent : themeColors.dark.borderSecondary
      }
      bg={
        isSong
          ? "rgba(255, 255, 0, 0.12)"
          : themeColors.dark.surfaceSecondary
      }
      style={{ alignSelf: "flex-start" }}
    >
      <MyText
        fontSize={moderateScale(8)}
        fontWeight="700"
        color={isSong ? themeColors.dark.accent : themeColors.dark.textMuted}
        style={{ textTransform: "uppercase", letterSpacing: 0.4 }}
      >
        {isSong ? "Song" : "Album"}
      </MyText>
    </XStack>
  );
}

function NewReleaseRow({
  item,
  songQueue,
}: {
  item: NewReleaseListItem;
  songQueue: ArtistSong[];
}) {
  const router = useRouter();
  const { playSongFromQueue } = usePlayback();

  if (isNewReleaseAlbum(item)) {
    const title = decodeHtmlEntities(item.name);
    const cover = getSongCoverUrl(item.image, "150x150");

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/home/album/[id]",
            params: { id: item.id },
          })
        }
      >
        <XStack items="center" gap={scale(12)} flex={1} width="100%">
          <Image
            source={{ uri: cover }}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: moderateScale(8),
            }}
            resizeMode="cover"
          />
          <YStack flex={1} style={{ minWidth: 0 }} justify="center" gap={verticalScale(6)}>
            <MyText
              fontSize={moderateScale(12)}
              fontWeight="600"
              color={themeColors.dark.onSurface}
              numberOfLines={1}
            >
              {title}
            </MyText>
            <TypeBadge kind="album" />
          </YStack>
          <XStack
            width={ACTION_SIZE}
            height={ACTION_SIZE}
            rounded={ACTION_SIZE / 2}
            borderWidth={1}
            borderColor={themeColors.dark.border}
            bg={themeColors.dark.surfaceSecondary}
            items="center"
            justify="center"
          >
            <ChevronRight
              size={moderateScale(20)}
              color={themeColors.dark.onSurface}
            />
          </XStack>
        </XStack>
      </Pressable>
    );
  }

  const song = item as ArtistSong;
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
      <XStack items="center" gap={scale(12)} flex={1} width="100%">
        <Image
          source={{ uri: cover }}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: moderateScale(8),
          }}
          resizeMode="cover"
        />
        <YStack flex={1} style={{ minWidth: 0 }} justify="center" gap={verticalScale(6)}>
          <MyText
            fontSize={moderateScale(12)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {title}
          </MyText>
          <TypeBadge kind="song" />
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

function NewReleaseColumn({
  items,
  songQueue,
}: {
  items: NewReleaseListItem[];
  songQueue: ArtistSong[];
}) {
  return (
    <YStack width={COLUMN_WIDTH} gap={verticalScale(16)}>
      {items.map((item) => (
        <NewReleaseRow
          key={
            isNewReleaseAlbum(item)
              ? `album-${item.id}`
              : `song-${item.id}`
          }
          item={item}
          songQueue={songQueue}
        />
      ))}
    </YStack>
  );
}

export default function NewReleasesSection() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["newReleases", NEW_RELEASES_QUEUE_FETCH_LIMIT, "home"],
    queryFn: () =>
      getNewReleases({
        limit: NEW_RELEASES_QUEUE_FETCH_LIMIT,
        offset: 0,
      }),
  });

  const allResults = data?.data?.results ?? [];
  const displayResults = useMemo(
    () => allResults.slice(0, NEW_RELEASES_DISPLAY_LIMIT_HOME),
    [allResults]
  );
  const songQueue = useMemo(
    () => getNewReleaseSongs(allResults),
    [allResults]
  );

  if (isLoading) {
    return <NewReleasesSectionSkeleton />;
  }

  if (isError) {
    return (
      <YStack px={scale(20)} py={verticalScale(24)}>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.textMuted}>
          Failed to load new releases
        </MyText>
      </YStack>
    );
  }

  if (displayResults.length === 0) {
    return (
      <YStack px={scale(20)} py={verticalScale(8)}>
        <XStack justify="space-between" items="center" mb={verticalScale(16)}>
          <MyText
            fontSize={moderateScale(18)}
            fontWeight="600"
            color={themeColors.dark.onSurface}
          >
            New Releases
          </MyText>
        </XStack>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.textMuted}>
          No new releases right now
        </MyText>
      </YStack>
    );
  }

  const columns: NewReleaseListItem[][] = [];
  for (let i = 0; i < displayResults.length; i += 3) {
    columns.push(displayResults.slice(i, i + 3));
  }

  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <MyText
          fontSize={moderateScale(18)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
        >
          New Releases
        </MyText>
        <Pressable
          onPress={() =>
            router.push("/home/new-releases" as never)
          }
        >
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
        {columns.map((columnItems, index) => (
          <NewReleaseColumn
            key={index}
            items={columnItems}
            songQueue={songQueue}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}
