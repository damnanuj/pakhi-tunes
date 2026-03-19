import { FlatList } from "react-native";
import { YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const HORIZONTAL_PADDING = scale(20);
const GAP = scale(16);
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP) / 2;
const IMAGE_SIZE = ITEM_WIDTH;
const SKELETON_COUNT = 12;

function SkeletonItem() {
  return (
    <YStack width={ITEM_WIDTH} items="center" mb={verticalScale(20)}>
      <SkeletonPlaceholder
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        borderRadius={IMAGE_SIZE / 2}
      />
      <SkeletonPlaceholder
        width={ITEM_WIDTH * 0.8}
        height={moderateScale(14)}
        borderRadius={moderateScale(4)}
        style={{ marginTop: verticalScale(12) }}
      />
      <SkeletonPlaceholder
        width={ITEM_WIDTH * 0.6}
        height={moderateScale(12)}
        borderRadius={moderateScale(4)}
        style={{ marginTop: verticalScale(8) }}
      />
    </YStack>
  );
}

export default function TopArtistsPageSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => <SkeletonItem />}
      contentContainerStyle={{
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: verticalScale(40),
      }}
      columnWrapperStyle={{ gap: GAP, justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
    />
  );
}
