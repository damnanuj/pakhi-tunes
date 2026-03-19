import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import themeColors from "src/utils/theme/colors";

const IMAGE_SIZE = moderateScale(56);
const PROFILE_IMAGE_SIZE = moderateScale(96);
const SKELETON_COUNT = 10;

function SkeletonArtistHeader() {
  return (
    <YStack
      alignItems="center"
      pb={verticalScale(24)}
      pt={verticalScale(16)}
      bg={themeColors.dark.surfaceSecondary}
      borderBottomLeftRadius={scale(24)}
      borderBottomRightRadius={scale(24)}
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
        style={{ marginTop: verticalScale(16) }}
      />
      <SkeletonPlaceholder
        width={scale(100)}
        height={moderateScale(12)}
        borderRadius={moderateScale(4)}
        style={{ marginTop: verticalScale(12) }}
      />
      <XStack gap={scale(24)} mt={verticalScale(24)}>
        <SkeletonPlaceholder
          width={moderateScale(56)}
          height={moderateScale(56)}
          borderRadius={moderateScale(28)}
        />
        <SkeletonPlaceholder
          width={moderateScale(56)}
          height={moderateScale(56)}
          borderRadius={moderateScale(28)}
        />
      </XStack>
    </YStack>
  );
}

function SkeletonItem() {
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
      <YStack flex={1} gap={verticalScale(8)} justify="center">
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
        width={moderateScale(20)}
        height={moderateScale(20)}
        borderRadius={moderateScale(4)}
      />
      <SkeletonPlaceholder
        width={moderateScale(40)}
        height={moderateScale(40)}
        borderRadius={moderateScale(20)}
      />
    </XStack>
  );
}

export default function ArtistSongsPageSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => <SkeletonItem />}
      ListHeaderComponent={<SkeletonArtistHeader />}
      contentContainerStyle={{
        paddingBottom: verticalScale(40),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
