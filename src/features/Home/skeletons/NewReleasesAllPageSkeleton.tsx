import { FlatList, ScrollView, View } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import themeColors from "src/utils/theme/colors";

/** Match NewReleasesAllPage + PillTabs + LibraryCard (subtitle + trailing icon) */
const CARD_GAP = scale(12);
const HORIZONTAL_PADDING = scale(20);
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const IMAGE_WIDTH = CARD_WIDTH - scale(12) * 2;
const IMAGE_HEIGHT = IMAGE_WIDTH / 1.2;
const GRID_ITEM_COUNT = 8;

/**
 * Match PillTabs: paddingVertical verticalScale(10) ×2 + ~14px label line (MyText 600).
 * No extra “All” pill — same count as typical language row without All.
 */
const PILL_HEIGHT = verticalScale(12) * 2 + moderateScale(16);
const PILL_WIDTHS = [
  scale(82),
  scale(96),
  scale(88),
  scale(104),
  scale(90),
  scale(98),
  scale(108),
  scale(92),
];

function SkeletonPillRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: scale(8),
        flexDirection: "row",
      }}
    >
      {PILL_WIDTHS.map((w, i) => (
        <SkeletonPlaceholder
          key={i}
          width={w}
          height={PILL_HEIGHT}
          borderRadius={moderateScale(12)}
        />
      ))}
    </ScrollView>
  );
}

export function SkeletonCard() {
  const actionSize = moderateScale(28);
  /** Reserve space for trailing icon + marginRight (matches LibraryCard). */
  const textMax = IMAGE_WIDTH - actionSize - scale(8);

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
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, minWidth: 0, marginRight: scale(8) }}>
          <SkeletonPlaceholder
            width={textMax * 0.88}
            height={moderateScale(14)}
            borderRadius={moderateScale(4)}
          />
          <SkeletonPlaceholder
            width={textMax * 0.58}
            height={moderateScale(12)}
            borderRadius={moderateScale(4)}
            style={{ marginTop: verticalScale(4) }}
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

/** Card grid only (e.g. language switch loading) — matches LibraryCard layout. */
export function NewReleasesCardGridSkeleton() {
  const data = Array.from({ length: GRID_ITEM_COUNT }, (_, i) => ({ key: i }));

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
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: verticalScale(12),
      }}
      contentContainerStyle={{
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(100),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function NewReleasesAllPageSkeleton() {
  const data = Array.from({ length: GRID_ITEM_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.key)}
      ListHeaderComponent={
        <View style={{ marginBottom: verticalScale(12) }}>
          <SkeletonPillRow />
        </View>
      }
      renderItem={() => (
        <View style={{ flex: 1, minWidth: 0, marginBottom: verticalScale(12) }}>
          <SkeletonCard />
        </View>
      )}
      columnWrapperStyle={{
        gap: CARD_GAP,
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: verticalScale(12),
      }}
      contentContainerStyle={{
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(100),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
