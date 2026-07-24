import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const IMAGE_SIZE = moderateScale(56);
const ICON_SIZE = moderateScale(20);

export default function SongListItemSkeleton() {
  return (
    <XStack
      items="center"
      gap={scale(12)}
      py={verticalScale(12)}
      px={scale(20)}
    >
      <SkeletonPlaceholder
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        borderRadius={moderateScale(8)}
      />
      <YStack flex={1} style={{ minWidth: 0 }} gap={verticalScale(8)} justify="center">
        <SkeletonPlaceholder
          width={scale(180)}
          height={moderateScale(14)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(120)}
          height={moderateScale(13)}
          borderRadius={moderateScale(4)}
        />
      </YStack>
      <SkeletonPlaceholder
        width={ICON_SIZE}
        height={ICON_SIZE}
        borderRadius={moderateScale(4)}
      />
    </XStack>
  );
}
