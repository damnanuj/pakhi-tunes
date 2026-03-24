import { FlatList, View } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import themeColors from "src/utils/theme/colors";

const CARD_GAP = scale(12);
const HORIZONTAL_PADDING = scale(20);
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const IMAGE_WIDTH = CARD_WIDTH - scale(12) * 2;
const IMAGE_HEIGHT = IMAGE_WIDTH / 1.2;
const SKELETON_COUNT = 8;

function SkeletonCard() {
  const actionSize = moderateScale(28);
  const titleLineMax = IMAGE_WIDTH - actionSize - scale(8);

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: moderateScale(16),
        overflow: "hidden",
        backgroundColor: themeColors.dark.surfaceSecondary,
        borderWidth: 1,
        borderColor: themeColors.dark.borderSecondary,
        padding: scale(12),
      }}
    >
      <SkeletonPlaceholder
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        borderRadius={moderateScale(10)}
      />
      <View
        style={{
          paddingTop: verticalScale(12),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, minWidth: 0, marginRight: scale(8) }}>
          <SkeletonPlaceholder
            width={titleLineMax * 0.82}
            height={moderateScale(14)}
            borderRadius={moderateScale(4)}
          />
        </View>
        <SkeletonPlaceholder
          width={moderateScale(28)}
          height={moderateScale(28)}
          borderRadius={moderateScale(14)}
        />
      </View>
    </View>
  );
}

export default function LibraryGridSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => (
        <View style={{ flex: 1, minWidth: 0, marginBottom: verticalScale(12) }}>
          <SkeletonCard />
        </View>
      )}
      columnWrapperStyle={{
        gap: CARD_GAP,
        paddingHorizontal: scale(20),
        marginBottom: verticalScale(12),
      }}
      contentContainerStyle={{
        paddingBottom: verticalScale(100),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
