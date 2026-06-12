import { memo, useCallback } from "react";
import { Pressable, ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import {
  useRecentSearches,
  useRecentSearchActions,
} from "../store/recentSearchStore";

interface RecentSearchesSectionProps {
  onSelect: (term: string) => void;
}

interface RecentSearchChipProps {
  term: string;
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
}

const RecentSearchChip = memo(function RecentSearchChip({
  term,
  onSelect,
  onRemove,
}: RecentSearchChipProps) {
  const handleSelect = useCallback(() => onSelect(term), [onSelect, term]);
  const handleRemove = useCallback(() => onRemove(term), [onRemove, term]);

  return (
    <XStack
      items="center"
      gap={scale(6)}
      px={scale(12)}
      py={verticalScale(6)}
      rounded={moderateScale(12)}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
      bg={themeColors.dark.surfaceSecondary}
    >
      <Pressable onPress={handleSelect} hitSlop={4}>
        <MyText
          fontSize={moderateScale(13)}
          weight="500"
          color={themeColors.dark.onSurface}
          numberOfLines={1}
        >
          {term}
        </MyText>
      </Pressable>
      <Pressable onPress={handleRemove} hitSlop={8}>
        <X size={moderateScale(14)} color={themeColors.dark.textMuted} />
      </Pressable>
    </XStack>
  );
});

function RecentSearchesSection({ onSelect }: RecentSearchesSectionProps) {
  const searches = useRecentSearches();
  const { removeSearch, clearAll } = useRecentSearchActions();

  if (searches.length === 0) {
    return null;
  }

  return (
    <YStack mb={verticalScale(12)}>
      <XStack
        items="center"
        px={scale(20)}
        gap={scale(12)}
        mb={verticalScale(8)}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            gap: scale(8),
            flexDirection: "row",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          {searches.map((term) => (
            <RecentSearchChip
              key={term.toLowerCase()}
              term={term}
              onSelect={onSelect}
              onRemove={removeSearch}
            />
          ))}
        </ScrollView>
        <Pressable onPress={clearAll} hitSlop={8}>
          <MyText
            fontSize={moderateScale(12)}
            weight="500"
            color={themeColors.dark.textMuted}
          >
            Clear all
          </MyText>
        </Pressable>
      </XStack>
    </YStack>
  );
}

export default memo(RecentSearchesSection);
