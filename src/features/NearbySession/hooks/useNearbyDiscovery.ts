import { useCallback, useEffect, useRef } from "react";
import { fetchNearbySessions } from "../services/session.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import { getCurrentCoordinates } from "../utils/locationPermission";

const SCAN_INTERVAL_MS = 4000;

export function useNearbyDiscovery(enabled: boolean) {
  const isScanning = useNearbySessionStore((s) => s.isScanning);
  const scanRadiusMeters = useNearbySessionStore((s) => s.scanRadiusMeters);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scanOnce = useCallback(async () => {
    const coords = await getCurrentCoordinates();
    if (!coords) {
      useNearbySessionStore.getState().setNearbySessions([]);
      return;
    }

    useNearbySessionStore.getState().setIsScanning(true);
    try {
      const result = await fetchNearbySessions({
        lat: coords.latitude,
        lng: coords.longitude,
        radius: scanRadiusMeters,
      });
      useNearbySessionStore.getState().setNearbySessions(result.sessions);
    } catch {
      useNearbySessionStore.getState().setNearbySessions([]);
    } finally {
      useNearbySessionStore.getState().setIsScanning(false);
    }
  }, [scanRadiusMeters]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    void scanOnce();
    intervalRef.current = setInterval(() => {
      void scanOnce();
    }, SCAN_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, scanOnce]);

  return { scanOnce, isScanning };
}
