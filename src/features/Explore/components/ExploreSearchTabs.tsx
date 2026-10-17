import PillTabs, { type PillTabItem } from "src/components/PillTabs";

export type SearchTabId = "songs" | "albums" | "artists" | "playlists";

const TAB_LABELS: Record<SearchTabId, string> = {
  songs: "Songs",
  albums: "Albums",
  artists: "Artists",
  playlists: "Playlists",
};

export interface ExploreSearchTabsProps {
  availableTabs: SearchTabId[];
  activeTab: SearchTabId;
  onTabChange: (tab: SearchTabId) => void;
}

export default function ExploreSearchTabs({
  availableTabs,
  activeTab,
  onTabChange,
}: ExploreSearchTabsProps) {
  const tabs: PillTabItem[] = availableTabs.map((id) => ({
    id,
    label: TAB_LABELS[id],
  }));

  return (
    <PillTabs
      tabs={tabs}
      activeId={activeTab}
      onTabChange={(id) => onTabChange(id as SearchTabId)}
    />
  );
}
