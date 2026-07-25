import type { Router } from "expo-router";
import { useNearbySessionStore } from "../store/nearbySessionStore";

export type ListenTogetherTab = "nearby" | "room";

export function resolveListenTogetherTab(
  roomCode: string | null,
  visibility: string | undefined
): ListenTogetherTab {
  return roomCode || visibility === "private" ? "room" : "nearby";
}

export function getActiveListenTogetherTab(): ListenTogetherTab {
  const { roomCode, activeSession } = useNearbySessionStore.getState();
  return resolveListenTogetherTab(roomCode, activeSession?.visibility);
}

export function openListenTogether(router: Router) {
  const tab = getActiveListenTogetherTab();
  router.push({
    pathname: "/home/nearby",
    params: { tab },
  });
}
