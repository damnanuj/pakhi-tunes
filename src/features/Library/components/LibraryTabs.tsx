import { ScrollView, TouchableOpacity } from "react-native";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

export type LibraryTabId = "recent" | "playlists" | "artists" | "albums";

const TABS: { id: LibraryTabId; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "playlists", label: "Playlists" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
];

export interface LibraryTabsProps {
  activeTab: LibraryTabId;
  onTabChange: (tab: LibraryTabId) => void;
}

export default function LibraryTabs({
  activeTab,
  onTabChange,
}: LibraryTabsProps) {
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
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: scale(16),
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(24),
              backgroundColor: isActive
                ? themeColors.dark.accent
                : themeColors.dark.surfaceSecondary,
            }}
          >
            <MyText
              fontSize={moderateScale(14)}
              weight="600"
              color={isActive ? themeColors.dark.onAccent : themeColors.dark.onSurface}
            >
              {tab.label}
            </MyText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
