import type { NetInfoState } from "@react-native-community/netinfo";

export function deriveOffline(state: NetInfoState): boolean {
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}

export function deriveOnline(state: NetInfoState): boolean {
  return !deriveOffline(state);
}
