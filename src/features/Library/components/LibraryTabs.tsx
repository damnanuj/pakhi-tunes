import PillTabs, { type PillTabItem } from "src/components/PillTabs";

export type LibraryTabId = "recent" | "playlists" | "artists" | "albums";

const LIBRARY_TABS: PillTabItem[] = [
  { id: "recent", label: "Recent" },
  { id: "playlists", label: "Playlists" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
];

export interface LibraryTabsProps {
  activeTab: LibraryTabId;
  onTabChange: (tab: LibraryTabId) => void;
}

/** Library filter tabs — uses shared {@link PillTabs}. */
export default function LibraryTabs({
  activeTab,
  onTabChange,
}: LibraryTabsProps) {
  return (
    <PillTabs
      tabs={LIBRARY_TABS}
      activeId={activeTab}
      onTabChange={(id) => onTabChange(id as LibraryTabId)}
    />
  );
}
