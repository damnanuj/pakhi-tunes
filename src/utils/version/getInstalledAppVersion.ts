import Constants from "expo-constants";

/** Prefer native APK versionName over embedded app.json (EAS remote version can differ in dev). */
export function getInstalledAppVersion(): string {
  return (
    Constants.nativeAppVersion ??
    Constants.expoConfig?.version ??
    "0.0.0"
  );
}
