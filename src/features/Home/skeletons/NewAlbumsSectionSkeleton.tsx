import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const ALBUM_SIZE = moderateScale(72);
const SKELETON_COUNT = 5;

export default function NewAlbumsSectionSkeleton() {
  return (
    <YStack px={scale(20)} pb={verticalScale(12)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <SkeletonPlaceholder
          width={scale(120)}
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
        contentContainerStyle={{ gap: scale(16) }}
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
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
            <SkeletonPlaceholder
              width={scale(40)}
              height={moderateScale(10)}
              borderRadius={moderateScale(4)}
              style={{ marginTop: verticalScale(4) }}
            />
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
