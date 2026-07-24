import { FlatList } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import SongListItemSkeleton from "src/features/ArtistSongs/skeletons/SongListItemSkeleton";

const COVER_SIZE = moderateScale(110);
const SKELETON_COUNT = 8;

function PlaylistHeaderSkeleton() {
  return (
    <YStack
      items="center"
      px={scale(20)}
      pt={verticalScale(8)}
      pb={verticalScale(20)}
      gap={verticalScale(14)}
    >
      <SkeletonPlaceholder
        width={COVER_SIZE}
        height={COVER_SIZE}
        borderRadius={moderateScale(14)}
      />
      <SkeletonPlaceholder
        width={scale(160)}
        height={moderateScale(22)}
        borderRadius={moderateScale(4)}
      />
      <SkeletonPlaceholder
        width={scale(80)}
        height={moderateScale(13)}
        borderRadius={moderateScale(4)}
      />
    </YStack>
  );
}

export default function PlaylistDetailSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => <SongListItemSkeleton />}
      ListHeaderComponent={<PlaylistHeaderSkeleton />}
      contentContainerStyle={{
        paddingBottom: verticalScale(40),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
