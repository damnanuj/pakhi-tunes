import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

/** Keep in sync with NewReleasesSection.tsx */
const COLUMN_WIDTH = scale(320);
const IMAGE_SIZE = moderateScale(56);
const ACTION_SIZE = moderateScale(40);
const ROW_GAP = verticalScale(16);
const ROW_INNER_GAP = verticalScale(6);
const SKELETON_COLUMNS = 4;
const ROWS_PER_COLUMN = 3;

function SkeletonRow() {
  return (
    <XStack
      items="center"
      gap={scale(12)}
      flex={1}
      width="100%"
      style={{ minWidth: 0 }}
    >
      <SkeletonPlaceholder
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        borderRadius={moderateScale(8)}
      />
      <YStack flex={1} style={{ minWidth: 0 }} gap={ROW_INNER_GAP}>
        {/* Title — matches MyText 12 */}
        <SkeletonPlaceholder
          width={scale(200)}
          height={moderateScale(12)}
          borderRadius={moderateScale(4)}
        />
        {/* Type badge — small pill (Song / Album) */}
        <SkeletonPlaceholder
          width={scale(40)}
          height={moderateScale(10)}
          borderRadius={moderateScale(4)}
        />
        {/* Artist line — matches song row (11); album rows omit this in UI */}
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

export default function NewReleasesSectionSkeleton() {
  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <SkeletonPlaceholder
          width={scale(130)}
          height={moderateScale(18)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(52)}
          height={moderateScale(14)}
          borderRadius={moderateScale(4)}
        />
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: scale(16), paddingRight: scale(20) }}
      >
        {Array.from({ length: SKELETON_COLUMNS }).map((_, col) => (
          <YStack key={col} width={COLUMN_WIDTH} gap={ROW_GAP}>
            {Array.from({ length: ROWS_PER_COLUMN }).map((__, row) => (
              <SkeletonRow key={row} />
            ))}
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
