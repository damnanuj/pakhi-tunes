import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const ARTIST_SIZE = moderateScale(72);
const SKELETON_COUNT = 6;

export default function TopArtistsSectionSkeleton() {
  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <SkeletonPlaceholder
          width={scale(100)}
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
        contentContainerStyle={{ gap: scale(16) }}
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <YStack
            key={i}
            items="center"
            style={{ maxWidth: ARTIST_SIZE + scale(8) }}
          >
            <SkeletonPlaceholder
              width={ARTIST_SIZE}
              height={ARTIST_SIZE}
              borderRadius={ARTIST_SIZE / 2}
            />
            <SkeletonPlaceholder
              width={ARTIST_SIZE * 0.8}
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
