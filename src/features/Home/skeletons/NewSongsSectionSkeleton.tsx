import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const IMAGE_SIZE = moderateScale(56);
const ACTION_SIZE = moderateScale(40);
const ROW_GAP = verticalScale(16);
const ROW_COUNT = 6;

function SkeletonRow() {
  return (
    <XStack items="center" gap={scale(12)} width="100%">
      <SkeletonPlaceholder
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        borderRadius={moderateScale(8)}
      />
      <YStack flex={1} style={{ minWidth: 0 }} gap={verticalScale(4)}>
        <SkeletonPlaceholder
          width={scale(200)}
          height={moderateScale(12)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(140)}
          height={moderateScale(11)}
          borderRadius={moderateScale(4)}
        />
      </YStack>
      <SkeletonPlaceholder
        width={ACTION_SIZE}
        height={ACTION_SIZE}
        borderRadius={ACTION_SIZE / 2}
      />
    </XStack>
  );
}

export default function NewSongsSectionSkeleton() {
  return (
    <YStack px={scale(20)} gap={ROW_GAP}>
      <XStack justify="space-between" items="center">
        <SkeletonPlaceholder
          width={scale(110)}
          height={moderateScale(18)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(52)}
          height={moderateScale(14)}
          borderRadius={moderateScale(4)}
        />
      </XStack>
      {Array.from({ length: ROW_COUNT }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </YStack>
  );
}
