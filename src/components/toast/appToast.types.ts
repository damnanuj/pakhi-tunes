export type AppToastVariant = "success" | "removed" | "progress" | "info" | "error";

export type AppToastIcon = "check" | "heart" | "heartOff" | "download" | "trash";

export type AppToast = {
  id: string;
  variant: AppToastVariant;
  message: string;
  icon: AppToastIcon;
  progress?: number;
  durationMs: number;
  contextId?: string;
};

export type ShowAppToastInput = {
  variant: AppToastVariant;
  message: string;
  icon?: AppToastIcon;
  progress?: number;
  durationMs?: number;
  contextId?: string;
};
