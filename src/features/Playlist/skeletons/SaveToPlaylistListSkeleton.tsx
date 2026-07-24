import { View } from "react-native";
import { YStack } from "tamagui";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";

const COVER_SIZE = moderateScale(48);
const COVER_RADIUS = moderateScale(8);
const CHECK_SIZE = moderateScale(24);
const ROW_COUNT = 6;

function SaveToPlaylistItemSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(20),
      }}
    >
      <SkeletonPlaceholder
        width={COVER_SIZE}
        height={COVER_SIZE}
        borderRadius={COVER_RADIUS}
      />
      <View style={{ flex: 1, gap: verticalScale(6) }}>
        <SkeletonPlaceholder
          width={scale(140)}
          height={moderateScale(14)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder
          width={scale(72)}
          height={moderateScale(11)}
          borderRadius={moderateScale(4)}
        />
      </View>
      <SkeletonPlaceholder
        width={CHECK_SIZE}
        height={CHECK_SIZE}
        borderRadius={CHECK_SIZE / 2}
      />
    </View>
  );
}

export default function SaveToPlaylistListSkeleton() {
  return (
    <YStack flex={1}>
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <SaveToPlaylistItemSkeleton key={index} />
      ))}
    </YStack>
  );
}
