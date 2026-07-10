/**
 * Master switch for app analytics (presence, live now-playing, listening stats).
 *
 * Priority (first match wins):
 * 1. EXPO_PUBLIC_ANALYTICS_TRACKING_ENABLED in .env / EAS build profile
 * 2. EXPO_PUBLIC_PRESENCE_TRACKING_ENABLED (legacy alias, still used in eas.json)
 * 3. ANALYTICS_TRACKING_CODE_TOGGLE below — flip true/false for local dev testing
 *
 * EAS profiles:
 * - development: false (no DB writes from dev clients)
 * - preview / production: true
 */
export const ANALYTICS_TRACKING_CODE_TOGGLE = false;

function readEnvFlag(value: string | undefined): boolean | null {
  if (value === undefined || value === "") {
    return null;
  }
  return value === "true";
}

export function isAnalyticsTrackingEnabled(): boolean {
  const fromAnalyticsEnv = readEnvFlag(
    process.env.EXPO_PUBLIC_ANALYTICS_TRACKING_ENABLED
  );
  if (fromAnalyticsEnv !== null) {
    return fromAnalyticsEnv;
  }

  const fromPresenceEnv = readEnvFlag(
    process.env.EXPO_PUBLIC_PRESENCE_TRACKING_ENABLED
  );
  if (fromPresenceEnv !== null) {
    return fromPresenceEnv;
  }

  return ANALYTICS_TRACKING_CODE_TOGGLE;
}
