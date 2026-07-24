import DownloadsList from "src/features/Downloads/components/DownloadsList";
import LibraryFavouritesList from "src/features/favorites/components/LibraryFavouritesList";
import LibraryRecentList from "src/features/history/components/LibraryRecentList";
import PlaylistsGrid from "src/features/Playlist/components/PlaylistsGrid";
import type { LibraryTabId } from "./LibraryTabs";

export type { LibraryItem } from "../types/libraryItem";

export interface LibraryGridProps {
  activeTab: LibraryTabId;
}

export default function LibraryGrid({ activeTab }: LibraryGridProps) {
  if (activeTab === "recent") {
    return <LibraryRecentList />;
  }

  if (activeTab === "favorites") {
    return <LibraryFavouritesList />;
  }

  if (activeTab === "downloads") {
    return <DownloadsList />;
  }

  return <PlaylistsGrid />;
}
