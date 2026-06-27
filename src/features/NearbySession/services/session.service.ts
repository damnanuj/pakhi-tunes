import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type { AuthUser } from "src/features/auth/types/auth.types";
import type {
  ActiveSession,
  NearbySession,
  UpsertSessionPayload,
} from "../types/session.types";

type ApiEnvelope<T> = {
  data: T;
  error: Record<string, unknown>;
  isSuccess: boolean;
};

export async function fetchNearbySessions(params: {
  lat: number;
  lng: number;
  radius?: number;
}) {
  const { data } = await apiClient.get<
    ApiEnvelope<{ sessions: NearbySession[]; radiusMeters: number }>
  >(endpoints.sessions.nearby, {
    params: {
      lat: params.lat,
      lng: params.lng,
      radius: params.radius,
    },
  });
  return data.data;
}

export async function upsertHostSession(payload: UpsertSessionPayload) {
  const { data } = await apiClient.post<
    ApiEnvelope<{ session: ActiveSession }>
  >(endpoints.sessions.create, payload);
  return data.data.session;
}

export async function fetchMySession() {
  const { data } = await apiClient.get<
    ApiEnvelope<{ session: ActiveSession | null }>
  >(endpoints.sessions.me);
  return data.data.session;
}

export async function stopHostSession(sessionId: string) {
  const { data } = await apiClient.delete<
    ApiEnvelope<{ stopped: boolean }>
  >(endpoints.sessions.item(sessionId));
  return data.data;
}

export async function patchSessionPosition(
  sessionId: string,
  payload: {
    positionMs: number;
    playing: boolean;
    latitude?: number;
    longitude?: number;
    trackId?: string;
  }
) {
  const { data } = await apiClient.patch<
    ApiEnvelope<{ session: ActiveSession }>
  >(endpoints.sessions.position(sessionId), payload);
  return data.data.session;
}

export async function updateDiscoverable(discoverable: boolean) {
  const { data } = await apiClient.patch<
    ApiEnvelope<{ user: AuthUser }>
  >(endpoints.users.discoverable, { discoverable });
  return data.data.user;
}
