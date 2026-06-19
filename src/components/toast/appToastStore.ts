import { create } from "zustand";
import type { AppToast, AppToastIcon, AppToastVariant, ShowAppToastInput } from "./appToast.types";

const DEFAULT_DISMISS_MS = 3000;

let toastIdCounter = 0;

function nextToastId(): string {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}`;
}

function isTransientVariant(variant: AppToastVariant): boolean {
  return variant === "success" || variant === "removed";
}

function defaultIcon(variant: AppToastVariant): AppToastIcon {
  switch (variant) {
    case "success":
      return "check";
    case "removed":
      return "trash";
    case "progress":
      return "download";
    case "error":
      return "trash";
    default:
      return "check";
  }
}

function buildToast(input: ShowAppToastInput, existingId?: string): AppToast {
  return {
    id: existingId ?? nextToastId(),
    variant: input.variant,
    message: input.message,
    icon: input.icon ?? defaultIcon(input.variant),
    progress: input.progress,
    durationMs:
      input.durationMs ??
      (input.variant === "progress" ? 0 : DEFAULT_DISMISS_MS),
    contextId: input.contextId,
  };
}

type AppToastState = {
  toast: AppToast | null;
  show: (input: ShowAppToastInput) => void;
  updateProgress: (contextId: string, progress: number, message?: string) => void;
  dismiss: () => void;
  dismissIfContext: (contextId: string) => void;
};

export const useAppToastStore = create<AppToastState>((set, get) => ({
  toast: null,
  show: (input) => {
    const current = get().toast;

    if (
      current &&
      isTransientVariant(current.variant) &&
      input.variant === "progress"
    ) {
      return;
    }

    const sameProgressContext =
      input.variant === "progress" &&
      current?.variant === "progress" &&
      current.contextId === input.contextId;

    set({
      toast: buildToast(
        input,
        sameProgressContext ? current.id : undefined
      ),
    });
  },
  updateProgress: (contextId, progress, message) => {
    const current = get().toast;
    if (
      !current ||
      current.variant !== "progress" ||
      current.contextId !== contextId
    ) {
      return;
    }

    set({
      toast: {
        ...current,
        progress,
        message: message ?? current.message,
      },
    });
  },
  dismiss: () => set({ toast: null }),
  dismissIfContext: (contextId) => {
    const current = get().toast;
    if (!current || current.contextId !== contextId) return;
    set({ toast: null });
  },
}));
