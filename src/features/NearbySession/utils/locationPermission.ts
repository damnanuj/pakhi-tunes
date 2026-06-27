import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { useNearbySessionStore } from "../store/nearbySessionStore";

export const LOCATION_PERMISSION_MESSAGE =
  "Pakhi Tunes uses your location to discover people listening to music nearby. Your location is only used while the app is open and is never stored permanently.";

export async function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
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
