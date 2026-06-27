import { useCallback, useEffect, useRef } from "react";
import { fetchNearbySessions } from "../services/session.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import { getCurrentCoordinates } from "../utils/locationPermission";
import type { NearbySession } from "../types/session.types";

const SCAN_INTERVAL_MS = 2500;
const STALE_SESSION_MS = 15_000;

export function isSessionFresh(session: NearbySession) {
  if (!session.updatedAt) return true;
  return Date.now() - new Date(session.updatedAt).getTime() < STALE_SESSION_MS;
}

export function useNearbyDiscovery(enabled: boolean) {
  const isScanning = useNearbySessionStore((s) => s.isScanning);
  const scanRadiusMeters = useNearbySessionStore((s) => s.scanRadiusMeters);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasEnabledRef = useRef(false);

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
      useNearbySessionStore
        .getState()
        .setNearbySessions(
          result.sessions.filter((s: NearbySession) => isSessionFresh(s))
        );
    } catch {
      useNearbySessionStore.getState().setNearbySessions([]);
    } finally {
      useNearbySessionStore.getState().setIsScanning(false);
    }
  }, [scanRadiusMeters]);

  useEffect(() => {
    if (!enabled) {
      wasEnabledRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!wasEnabledRef.current) {
      wasEnabledRef.current = true;
      void scanOnce();
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

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
