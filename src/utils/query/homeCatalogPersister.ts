import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";
import {
  HOME_PHONE_CACHE_MS,
  TOP_ARTISTS_HOME_LIMIT,
} from "src/features/Home/queries/homeCatalogQuery";
import { NEW_RELEASES_QUEUE_FETCH_LIMIT } from "src/utils/constants/newReleases";

export const homeCatalogPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "pakhi-home-catalog",
});

/** Only the four homepage responses. Search, playlists, auth, and nearby stay out. */
export function shouldPersistHomeQuery(query: Query): boolean {
  if (query.state.status !== "success") return false;

  const key = query.queryKey;
  if (key.length === 1 && key[0] === "genres") return true;
  if (key[0] === "topArtists" && key[1] === TOP_ARTISTS_HOME_LIMIT) return true;
  if (
    key[0] === "newReleases" &&
    key[1] === NEW_RELEASES_QUEUE_FETCH_LIMIT &&
    (key[2] === "song" || key[2] === "album") &&
    key[3] === "home"
  ) {
    return true;
  }
  return false;
}

export const homeCatalogPersistOptions = {
  persister: homeCatalogPersister,
  maxAge: HOME_PHONE_CACHE_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistHomeQuery,
  },
};
