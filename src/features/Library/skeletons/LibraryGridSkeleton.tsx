import { FlatList, View } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import SkeletonPlaceholder from "src/components/SkeletonPlaceholder";
import themeColors from "src/utils/theme/colors";
import {
  getLibraryGridCardColumnWidth,
  LIBRARY_GRID_COLUMN_WRAPPER_STYLE,
  LIBRARY_ROW_WRAPPER_STYLE,
} from "../libraryGridLayout";

const CARD_INNER_PADDING = scale(12);
const IMAGE_WIDTH = getLibraryGridCardColumnWidth() - CARD_INNER_PADDING * 2;
const IMAGE_HEIGHT = IMAGE_WIDTH / 1.2;
const SKELETON_COUNT = 8;

export interface LibraryGridSkeletonProps {
  /** Matches scroll list bottom inset (tab bar + mini player + gap). */
  contentBottomPadding?: number;
}

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
        padding: CARD_INNER_PADDING,
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
        <View
          style={{
            width: actionSize,
            height: actionSize,
            borderRadius: moderateScale(14),
            backgroundColor: themeColors.dark.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SkeletonPlaceholder
            width={moderateScale(16)}
            height={moderateScale(16)}
            borderRadius={moderateScale(4)}
          />
        </View>
      </View>
    </View>
  );
}

export default function LibraryGridSkeleton({
  contentBottomPadding = verticalScale(100),
}: LibraryGridSkeletonProps) {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => (
        <View style={LIBRARY_ROW_WRAPPER_STYLE}>
          <SkeletonCard />
        </View>
      )}
      columnWrapperStyle={LIBRARY_GRID_COLUMN_WRAPPER_STYLE}
      contentContainerStyle={{
        paddingBottom: contentBottomPadding,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
