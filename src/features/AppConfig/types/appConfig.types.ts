export interface ReleaseSection {
  title: string;
  items: string[];
}

export interface AppConfigData {
  updateAvailable: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
  title: string;
  message: string;
  releaseSections: ReleaseSection[];
}

export interface AppConfigResponse {
  data: AppConfigData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}
