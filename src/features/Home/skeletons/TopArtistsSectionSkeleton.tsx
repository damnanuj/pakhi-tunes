import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

/** Keep in sync with TopArtistsSection.tsx */
const ARTIST_SIZE = moderateScale(72);
const TOP_ARTISTS_LIMIT = 10;

export default function TopArtistsSectionSkeleton() {
  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        {/* Section title — MyText 18 / semibold */}
        <SkeletonPlaceholder
          width={scale(130)}
          height={moderateScale(18)}
          borderRadius={moderateScale(4)}
        />
        {/* "See All" — MyText 14 */}
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
        {Array.from({ length: TOP_ARTISTS_LIMIT }).map((_, i) => (
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
            {/* Name — MyText 12 */}
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
