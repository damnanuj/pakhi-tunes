import { ScrollView, TouchableOpacity } from "react-native";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

export interface PillTabItem {
  id: string;
  label: string;
}

export interface PillTabsProps {
  tabs: PillTabItem[];
  activeId: string;
  onTabChange: (id: string) => void;
}

/**
 * Horizontal scrollable pill tabs (shared Library / New Releases language filter, etc.).
 */
export default function PillTabs({ tabs, activeId, onTabChange }: PillTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: scale(20),
        gap: scale(8),
        flexDirection: "row",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <TouchableOpacity
            key={tab.id === "" ? "__all__" : tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: scale(16),
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(12),
              borderWidth: 1,
              borderColor: themeColors.dark.borderSecondary,
              backgroundColor: isActive
                ? themeColors.dark.accent
                : themeColors.dark.surfaceSecondary,
            }}
          >
            <MyText
              fontSize={moderateScale(14)}
              weight="600"
              color={
                isActive
                  ? themeColors.dark.onAccent
                  : themeColors.dark.onSurface
              }
            >
              {tab.label}
            </MyText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
