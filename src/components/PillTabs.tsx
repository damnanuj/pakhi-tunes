import { useCallback, useEffect, useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";
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

type TabLayout = { x: number; width: number };

/**
 * Horizontal scrollable pill tabs (shared Library / New Releases language filter, etc.).
 * Scrolls the active pill fully into view when `activeId` changes.
 */
export default function PillTabs({ tabs, activeId, onTabChange }: PillTabsProps) {
  const scrollRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<Record<string, TabLayout>>({});
  const viewportWidthRef = useRef(0);
  const contentWidthRef = useRef(0);

  const scrollActiveIntoView = useCallback(() => {
    const layout = layoutsRef.current[activeId];
    const viewportWidth = viewportWidthRef.current;
    const contentWidth = contentWidthRef.current;
    if (!layout || viewportWidth <= 0) return;

    const maxScroll = Math.max(0, contentWidth - viewportWidth);
    const centerX = layout.x + layout.width / 2;
    const scrollX = Math.max(
      0,
      Math.min(centerX - viewportWidth / 2, maxScroll)
    );

    scrollRef.current?.scrollTo({ x: scrollX, animated: true });
  }, [activeId]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollActiveIntoView();
    });
    return () => cancelAnimationFrame(id);
  }, [scrollActiveIntoView, tabs]);

  const handleTabLayout = useCallback(
    (tabId: string, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      layoutsRef.current[tabId] = { x, width };
      if (tabId === activeId) {
        scrollActiveIntoView();
      }
    },
    [activeId, scrollActiveIntoView]
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => {
        viewportWidthRef.current = event.nativeEvent.layout.width;
        scrollActiveIntoView();
      }}
      onContentSizeChange={(width) => {
        contentWidthRef.current = width;
        scrollActiveIntoView();
      }}
      contentContainerStyle={{
        paddingHorizontal: scale(20),
        gap: scale(8),
        flexDirection: "row",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <View
            key={tab.id === "" ? "__all__" : tab.id}
            onLayout={(event) => handleTabLayout(tab.id, event)}
          >
            <TouchableOpacity
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
          </View>
        );
      })}
    </ScrollView>
  );
}
