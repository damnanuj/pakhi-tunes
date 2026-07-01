import { useEffect } from "react";
import { Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Check, Download, Heart, HeartOff, Trash2 } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import { TAB_BAR_Z_INDEX } from "src/constants/tabBar";
import { useToastBottomOffset } from "src/hooks/useToastBottomOffset";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import type { AppToast, AppToastIcon, AppToastVariant } from "./appToast.types";
import { useAppToastStore } from "./appToastStore";

const TOAST_STYLES: Record<
  AppToastVariant,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  success: {
    backgroundColor: "#14532d",
    borderColor: "rgba(187, 247, 208, 0.35)",
    textColor: "#bbf7d0",
    iconColor: "#bbf7d0",
  },
  removed: {
    backgroundColor: "#4c1d24",
    borderColor: "rgba(254, 205, 211, 0.35)",
    textColor: "#fecdd3",
    iconColor: "#fecdd3",
  },
  progress: {
    backgroundColor: themeColors.dark.surface,
    borderColor: themeColors.dark.borderSecondary,
    textColor: themeColors.dark.onSurface,
    iconColor: themeColors.dark.accent,
  },
  info: {
    backgroundColor: themeColors.dark.surface,
    borderColor: themeColors.dark.borderSecondary,
    textColor: themeColors.dark.onSurface,
    iconColor: themeColors.dark.accent,
  },
  error: {
    backgroundColor: "#4c1d24",
    borderColor: "rgba(254, 205, 211, 0.35)",
    textColor: "#fecdd3",
    iconColor: "#fecdd3",
  },
};

function ToastIcon({ icon, color }: { icon: AppToastIcon; color: string }) {
  const size = moderateScale(18);

  switch (icon) {
    case "heart":
      return <Heart size={size} color={color} fill={color} />;
    case "heartOff":
      return <HeartOff size={size} color={color} />;
    case "download":
      return <Download size={size} color={color} />;
    case "trash":
      return <Trash2 size={size} color={color} />;
    default:
      return <Check size={size} color={color} />;
  }
}

function ToastContent({ toast }: { toast: AppToast }) {
  const styles = TOAST_STYLES[toast.variant];
  const progressPercent = Math.round((toast.progress ?? 0) * 100);

  if (toast.variant === "progress") {
    return (
      <XStack items="center" gap={scale(10)}>
        <ToastIcon icon={toast.icon} color={styles.iconColor} />
        <YStack flex={1} gap={verticalScale(6)} style={{ minWidth: 0 }}>
          <MyText
            fontSize={moderateScale(13)}
            weight="600"
            color={styles.textColor}
            numberOfLines={1}
          >
            {toast.message}
          </MyText>
          <View
            style={{
              height: verticalScale(3),
              borderRadius: verticalScale(2),
              backgroundColor: themeColors.dark.borderSecondary,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                backgroundColor: themeColors.dark.accent,
                borderRadius: verticalScale(2),
              }}
            />
          </View>
        </YStack>
      </XStack>
    );
  }

  return (
    <XStack items="center" gap={scale(10)}>
      <ToastIcon icon={toast.icon} color={styles.iconColor} />
      <MyText
        flex={1}
        fontSize={moderateScale(13)}
        weight="600"
        color={styles.textColor}
        numberOfLines={1}
      >
        {toast.message}
      </MyText>
    </XStack>
  );
}

export default function AppToast() {
  const toast = useAppToastStore((s) => s.toast);
  const dismiss = useAppToastStore((s) => s.dismiss);
  const bottomOffset = useToastBottomOffset();

  const isAutoDismiss =
    toast?.variant === "success" ||
    toast?.variant === "removed" ||
    toast?.variant === "info" ||
    toast?.variant === "error";

  useEffect(() => {
    if (!toast || !isAutoDismiss || toast.durationMs <= 0) return;

    const timer = setTimeout(() => {
      dismiss();
    }, toast.durationMs);

    return () => clearTimeout(timer);
  }, [toast?.id, isAutoDismiss, toast?.durationMs, dismiss]);

  if (!toast) {
    return null;
  }

  const styles = TOAST_STYLES[toast.variant];

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      pointerEvents="none"
      style={{
        position: "absolute",
        left: scale(16),
        right: scale(16),
        bottom: bottomOffset,
        zIndex: TAB_BAR_Z_INDEX + 1,
      }}
    >
      <View
        style={{
          borderRadius: moderateScale(12),
          borderWidth: 1,
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor,
          paddingVertical: verticalScale(10),
          paddingHorizontal: scale(14),
          ...(Platform.OS === "ios"
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
              }
            : { elevation: 10 }),
        }}
      >
        <ToastContent toast={toast} />
      </View>
    </Animated.View>
  );
}
