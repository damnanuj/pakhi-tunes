import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const ROW_SIZE = moderateScale(56);
const ROW_COUNT = 8;

function SearchRowSkeleton({ round = false }: { round?: boolean }) {
  return (
    <XStack
      items="center"
      gap={scale(12)}
      px={scale(20)}
      py={verticalScale(10)}
    >
      <SkeletonPlaceholder
        width={ROW_SIZE}
        height={ROW_SIZE}
        borderRadius={round ? ROW_SIZE / 2 : moderateScale(8)}
      />
      <YStack flex={1} gap={verticalScale(8)}>
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
    </XStack>
  );
}

export default function SearchPageSkeleton() {
  return (
    <FlatList
      data={Array.from({ length: ROW_COUNT }, (_, index) => index)}
      keyExtractor={(item) => String(item)}
      scrollEnabled={false}
      ListHeaderComponent={
        <YStack px={scale(20)} pt={verticalScale(8)} pb={verticalScale(8)}>
          <SkeletonPlaceholder
            width={scale(110)}
            height={moderateScale(16)}
            borderRadius={moderateScale(4)}
          />
        </YStack>
      }
      renderItem={({ index }) => <SearchRowSkeleton round={index < 2} />}
      showsVerticalScrollIndicator={false}
    />
  );
}
