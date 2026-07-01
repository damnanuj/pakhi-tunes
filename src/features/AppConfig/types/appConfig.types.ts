export interface AppConfigData {
  updateAvailable: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
  title: string;
  message: string;
}

export interface AppConfigResponse {
  data: AppConfigData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}
