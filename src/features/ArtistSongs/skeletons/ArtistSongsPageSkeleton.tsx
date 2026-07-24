import { FlatList } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import themeColors from "src/utils/theme/colors";
import SongListItemSkeleton from "./SongListItemSkeleton";

const PROFILE_IMAGE_SIZE = moderateScale(100);
const SKELETON_COUNT = 10;

function SkeletonArtistHeader() {
  return (
    <YStack
      items="center"
      pb={verticalScale(24)}
      bg={themeColors.dark.background}
      borderColor={themeColors.dark.borderSecondary}
    >
      <SkeletonPlaceholder
        width={PROFILE_IMAGE_SIZE}
        height={PROFILE_IMAGE_SIZE}
        borderRadius={PROFILE_IMAGE_SIZE / 2}
      />
      <SkeletonPlaceholder
        width={scale(120)}
        height={moderateScale(16)}
        borderRadius={moderateScale(4)}
        style={{ marginTop: verticalScale(8) }}
      />
      <SkeletonPlaceholder
        width={scale(150)}
        height={moderateScale(14)}
        borderRadius={moderateScale(4)}
        style={{ marginTop: verticalScale(8) }}
      />
    </YStack>
  );
}

export default function ArtistSongsPageSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => <SongListItemSkeleton />}
      ListHeaderComponent={<SkeletonArtistHeader />}
      contentContainerStyle={{
        paddingBottom: verticalScale(40),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
