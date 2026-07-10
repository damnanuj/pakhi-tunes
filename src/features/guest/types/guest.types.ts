export type GuestPlatform = "ios" | "android" | "web";

export type GuestStatus = "active" | "inactive" | "converted" | "banned";

export interface GuestRecord {
  id: string;
  deviceId: string;
  platform: GuestPlatform;
  appVersion: string;
  status: GuestStatus;
  convertedUserId: string | null;
  convertedAt: string | null;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPingResponse {
  guest?: GuestRecord;
  isNew?: boolean;
  converted?: boolean;
  reactivated?: boolean;
}

export interface GuestPingPayload {
  deviceId: string;
  platform: GuestPlatform;
  appVersion: string;
  slug?: string;
}

export interface GuestPingApiResponse {
  data: GuestPingResponse;
  error: Record<string, unknown>;
  isSuccess: boolean;
}
