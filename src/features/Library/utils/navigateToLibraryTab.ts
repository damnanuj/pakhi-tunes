import type { Router } from "expo-router";
import type { LibraryTabId } from "../components/LibraryTabs";

export type ProfileLibraryTabId = Extract<
  LibraryTabId,
  "recent" | "favorites" | "downloads" | "playlists"
>;

const LIBRARY_TAB_IDS: LibraryTabId[] = [
  "recent",
  "favorites",
  "downloads",
  "playlists",
];

export function isLibraryTabId(value: string | undefined): value is LibraryTabId {
  return Boolean(value && LIBRARY_TAB_IDS.includes(value as LibraryTabId));
}

export function navigateToLibraryTab(
  router: Pick<Router, "navigate">,
  tab: LibraryTabId
) {
  router.navigate({
    pathname: "/(tabs)/library",
    params: { tab },
  });
}
