import { ScrollView, View } from "react-native";
import {
  scale,
  moderateScale,
  verticalScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";

const CARD_WIDTH = (SCREEN_WIDTH - scale(20) * 3) / 2;
const CARD_HEIGHT = moderateScale(180);
const SKELETON_COUNT = 6;

export default function FeaturedCardsSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: scale(20),
        gap: scale(12),
        flexDirection: "row",
      }}
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View
          key={index}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: moderateScale(16),
            overflow: "hidden",
          }}
        >
          <SkeletonPlaceholder
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            borderRadius={moderateScale(16)}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(16),
            }}
          >
            <SkeletonPlaceholder
              width={scale(100)}
              height={moderateScale(20)}
              borderRadius={moderateScale(4)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
