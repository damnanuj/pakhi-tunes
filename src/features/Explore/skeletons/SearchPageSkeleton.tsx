import { FlatList, ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import SongListItemSkeleton from "src/features/ArtistSongs/skeletons/SongListItemSkeleton";

const ALBUM_SIZE = moderateScale(72);
const ARTIST_SIZE = moderateScale(72);
const HORIZONTAL_SKELETON_COUNT = 5;
const SONG_SKELETON_COUNT = 6;

function HorizontalAlbumRowSkeleton() {
  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <SkeletonPlaceholder
        width={scale(80)}
        height={moderateScale(18)}
        borderRadius={moderateScale(4)}
        style={{ marginBottom: verticalScale(16) }}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {Array.from({ length: HORIZONTAL_SKELETON_COUNT }).map((_, index) => (
          <YStack
            key={index}
            items="center"
            style={{ maxWidth: ALBUM_SIZE + scale(8) }}
          >
            <SkeletonPlaceholder
              width={ALBUM_SIZE}
              height={ALBUM_SIZE}
              borderRadius={moderateScale(8)}
            />
            <SkeletonPlaceholder
              width={ALBUM_SIZE}
              height={moderateScale(12)}
              borderRadius={moderateScale(4)}
              style={{ marginTop: verticalScale(8) }}
            />
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}

function HorizontalArtistRowSkeleton() {
  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <SkeletonPlaceholder
        width={scale(80)}
        height={moderateScale(18)}
        borderRadius={moderateScale(4)}
        style={{ marginBottom: verticalScale(16) }}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16) }}
      >
        {Array.from({ length: HORIZONTAL_SKELETON_COUNT }).map((_, index) => (
          <YStack
            key={index}
            items="center"
            style={{ maxWidth: ARTIST_SIZE + scale(8) }}
          >
            <SkeletonPlaceholder
              width={ARTIST_SIZE}
              height={ARTIST_SIZE}
              borderRadius={ARTIST_SIZE / 2}
            />
            <SkeletonPlaceholder
              width={ARTIST_SIZE * 0.85}
              height={moderateScale(12)}
              borderRadius={moderateScale(4)}
              style={{ marginTop: verticalScale(8) }}
            />
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}

export default function SearchPageSkeleton() {
  const data = Array.from({ length: SONG_SKELETON_COUNT }, (_, i) => ({
    key: i,
  }));

  return (
    <YStack>
      <HorizontalAlbumRowSkeleton />
      <HorizontalArtistRowSkeleton />
      <YStack px={scale(20)} pb={verticalScale(8)}>
        <SkeletonPlaceholder
          width={scale(64)}
          height={moderateScale(18)}
          borderRadius={moderateScale(4)}
        />
      </YStack>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.key)}
        renderItem={() => <SongListItemSkeleton />}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
