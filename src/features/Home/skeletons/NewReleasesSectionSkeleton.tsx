import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const COLUMN_WIDTH = scale(320);
const ROW_HEIGHT = moderateScale(56);
const SKELETON_COLUMNS = 3;
const ROWS_PER_COLUMN = 3;

function SkeletonRow() {
  return (
    <XStack items="center" gap={scale(12)} width="100%">
      <SkeletonPlaceholder
        width={ROW_HEIGHT}
        height={ROW_HEIGHT}
        borderRadius={moderateScale(8)}
      />
      <YStack flex={1} gap={verticalScale(6)}>
        <SkeletonPlaceholder
          width={scale(180)}
          height={moderateScale(14)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(120)}
          height={moderateScale(12)}
          borderRadius={moderateScale(4)}
        />
      </YStack>
      <SkeletonPlaceholder
        width={moderateScale(40)}
        height={moderateScale(40)}
        borderRadius={moderateScale(20)}
      />
    </XStack>
  );
}

export default function NewReleasesSectionSkeleton() {
  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <SkeletonPlaceholder
          width={scale(120)}
          height={moderateScale(18)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(50)}
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
          <YStack key={col} width={COLUMN_WIDTH} gap={verticalScale(16)}>
            {Array.from({ length: ROWS_PER_COLUMN }).map((__, row) => (
              <SkeletonRow key={row} />
            ))}
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
