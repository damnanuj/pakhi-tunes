import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { useNearbySessionStore } from "../store/nearbySessionStore";

export const LOCATION_PERMISSION_TITLE = "Need location access";
export const LOCATION_PERMISSION_SUBTITLE = "Find music nearby";
export const LOCATION_PERMISSION_MESSAGE =
  "Pakhi Tunes uses your location to discover people listening to music nearby. Your location is only used while the app is open and is never stored permanently.";

export const LOCATION_SETTINGS_MESSAGE =
  "Enable location in Settings to discover and share nearby listening sessions.";

export const DIALOG_ALLOW = "Allow";
export const DIALOG_CANCEL = "Cancel";
export const DIALOG_SETTINGS = "Settings";

let cachedCoords: { latitude: number; longitude: number; at: number } | null =
  null;
const COORD_CACHE_TTL = 10_000;

export async function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return null;

  if (cachedCoords && Date.now() - cachedCoords.at < COORD_CACHE_TTL) {
    return {
      latitude: cachedCoords.latitude,
      longitude: cachedCoords.longitude,
    };
  }

  const last = await Location.getLastKnownPositionAsync();
  if (last) {
    cachedCoords = {
      latitude: last.coords.latitude,
      longitude: last.coords.longitude,
      at: Date.now(),
    };
    return {
      latitude: cachedCoords.latitude,
      longitude: cachedCoords.longitude,
    };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  cachedCoords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    at: Date.now(),
  };
  return {
    latitude: cachedCoords.latitude,
    longitude: cachedCoords.longitude,
  };
}

export async function requestLocationPermission(): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === Location.PermissionStatus.GRANTED) {
    useNearbySessionStore.getState().setLocationPermission("granted");
    return true;
  }

  const result = await Location.requestForegroundPermissionsAsync();
  const granted = result.status === Location.PermissionStatus.GRANTED;
  useNearbySessionStore
    .getState()
    .setLocationPermission(granted ? "granted" : "denied");
  return granted;
}

export async function openAppSettings() {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
    return;
  }
  await Linking.openSettings();
}
