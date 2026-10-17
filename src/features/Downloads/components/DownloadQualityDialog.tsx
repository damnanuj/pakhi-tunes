import { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Dialog, Button, YStack, XStack } from "tamagui";
import { Check } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import {
  DIALOG_CONTENT_ANIMATION,
  DIALOG_ENTER_STYLE,
  DIALOG_EXIT_STYLE,
  DIALOG_OVERLAY_ANIMATION,
  DIALOG_OVERLAY_OPACITY,
} from "src/components/dialogMotion";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import type { DownloadQuality } from "../types/download.types";
import {
  DEFAULT_DOWNLOAD_QUALITY,
  DOWNLOAD_QUALITY_OPTIONS,
} from "../types/download.types";

interface DownloadQualityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quality: DownloadQuality, remember: boolean) => void;
  onAskEveryTime?: () => void;
  isSubmitting?: boolean;
  confirmDisabled?: boolean;
  /** Download flow can remember the choice. Settings hides this. */
  showRememberCheckbox?: boolean;
  /** Settings can clear a saved quality so the download popup returns. */
  allowAskEveryTime?: boolean;
  currentQuality?: DownloadQuality | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export default function DownloadQualityDialog({
  open,
  onOpenChange,
  onConfirm,
  onAskEveryTime,
  isSubmitting = false,
  confirmDisabled = false,
  showRememberCheckbox = true,
  allowAskEveryTime = false,
  currentQuality = null,
  title = "Download song",
  description = "Choose audio quality for offline listening",
  confirmLabel = "Download",
}: DownloadQualityDialogProps) {
  const [selectedQuality, setSelectedQuality] = useState<DownloadQuality | null>(
    DEFAULT_DOWNLOAD_QUALITY
  );
  const [remember, setRemember] = useState(false);

  useDismissOnBack(open, () => onOpenChange(false));

  useEffect(() => {
    if (open) {
      setSelectedQuality(
        allowAskEveryTime ? currentQuality : currentQuality ?? DEFAULT_DOWNLOAD_QUALITY
      );
      setRemember(false);
    }
  }, [allowAskEveryTime, currentQuality, open]);

  const handleConfirm = useCallback(() => {
    if (!selectedQuality) {
      onAskEveryTime?.();
      onOpenChange(false);
      return;
    }
    onConfirm(selectedQuality, showRememberCheckbox ? remember : true);
    if (allowAskEveryTime) {
      onOpenChange(false);
    }
  }, [
    allowAskEveryTime,
    onAskEveryTime,
    onConfirm,
    onOpenChange,
    remember,
    selectedQuality,
    showRememberCheckbox,
  ]);

  const downloadDisabled = isSubmitting || confirmDisabled;

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation={DIALOG_OVERLAY_ANIMATION}
          opacity={DIALOG_OVERLAY_OPACITY}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          bordered
          elevate
          animation={DIALOG_CONTENT_ANIMATION}
          enterStyle={DIALOG_ENTER_STYLE}
          exitStyle={DIALOG_EXIT_STYLE}
          bg={themeColors.dark.surface}
          p={scale(20)}
          gap={verticalScale(16)}
          rounded={moderateScale(16)}
          width="90%"
          maxW={scale(340)}
        >
          <YStack gap={verticalScale(8)}>
            <Dialog.Title
              p={0}
              m={0}
              fontSize={moderateScale(18)}
              lineHeight={moderateScale(24)}
            >
              <MyText
                fontSize={moderateScale(18)}
                lineHeight={moderateScale(24)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                {title}
              </MyText>
            </Dialog.Title>
            <Dialog.Description
              p={0}
              m={0}
              fontSize={moderateScale(13)}
              lineHeight={moderateScale(18)}
            >
              <MyText
                fontSize={moderateScale(13)}
                lineHeight={moderateScale(18)}
                weight="400"
                color={themeColors.dark.textMuted}
              >
                {description}
              </MyText>
            </Dialog.Description>
          </YStack>

          <YStack gap={verticalScale(10)}>
            {DOWNLOAD_QUALITY_OPTIONS.map((option) => {
              const isSelected = selectedQuality === option.quality;
              return (
                <Pressable
                  key={option.quality}
                  onPress={() => setSelectedQuality(option.quality)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <XStack
                    items="center"
                    gap={scale(12)}
                    p={scale(12)}
                    rounded={moderateScale(12)}
                    borderWidth={1}
                    borderColor={
                      isSelected
                        ? themeColors.dark.accent
                        : themeColors.dark.borderSecondary
                    }
                    bg={
                      isSelected
                        ? "rgba(255, 255, 0, 0.08)"
                        : themeColors.dark.surfaceSecondary
                    }
                  >
                    <XStack
                      width={moderateScale(20)}
                      height={moderateScale(20)}
                      rounded={moderateScale(10)}
                      borderWidth={2}
                      borderColor={
                        isSelected
                          ? themeColors.dark.accent
                          : themeColors.dark.borderSecondary
                      }
                      bg={
                        isSelected ? themeColors.dark.accent : "transparent"
                      }
                      items="center"
                      justify="center"
                    >
                      {isSelected ? (
                        <Check
                          size={moderateScale(12)}
                          color={themeColors.dark.onAccent}
                          strokeWidth={3}
                        />
                      ) : null}
                    </XStack>
                    <MyText
                      flex={1}
                      fontSize={moderateScale(15)}
                      weight="700"
                      color={themeColors.dark.onSurface}
                    >
                      {option.label} ({option.quality})
                    </MyText>
                  </XStack>
                </Pressable>
              );
            })}
            {allowAskEveryTime ? (
              <Pressable
                onPress={() => setSelectedQuality(null)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedQuality == null }}
              >
                <XStack
                  items="center"
                  gap={scale(12)}
                  p={scale(12)}
                  rounded={moderateScale(12)}
                  borderWidth={1}
                  borderColor={
                    selectedQuality == null
                      ? themeColors.dark.accent
                      : themeColors.dark.borderSecondary
                  }
                  bg={
                    selectedQuality == null
                      ? "rgba(255, 255, 0, 0.08)"
                      : themeColors.dark.surfaceSecondary
                  }
                >
                  <XStack
                    width={moderateScale(20)}
                    height={moderateScale(20)}
                    rounded={moderateScale(10)}
                    borderWidth={2}
                    borderColor={
                      selectedQuality == null
                        ? themeColors.dark.accent
                        : themeColors.dark.borderSecondary
                    }
                    bg={
                      selectedQuality == null
                        ? themeColors.dark.accent
                        : "transparent"
                    }
                    items="center"
                    justify="center"
                  >
                    {selectedQuality == null ? (
                      <Check
                        size={moderateScale(12)}
                        color={themeColors.dark.onAccent}
                        strokeWidth={3}
                      />
                    ) : null}
                  </XStack>
                  <MyText
                    flex={1}
                    fontSize={moderateScale(15)}
                    weight="700"
                    color={themeColors.dark.onSurface}
                  >
                    Ask every time
                  </MyText>
                </XStack>
              </Pressable>
            ) : null}
          </YStack>

          {showRememberCheckbox ? (
            <Pressable
              onPress={() => setRemember((value) => !value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
            >
              <XStack items="center" gap={scale(12)}>
                <XStack
                  width={moderateScale(20)}
                  height={moderateScale(20)}
                  rounded={moderateScale(4)}
                  borderWidth={2}
                  borderColor={
                    remember
                      ? themeColors.dark.accent
                      : themeColors.dark.borderSecondary
                  }
                  bg={remember ? themeColors.dark.accent : "transparent"}
                  items="center"
                  justify="center"
                >
                  {remember ? (
                    <Check
                      size={moderateScale(12)}
                      color={themeColors.dark.onAccent}
                      strokeWidth={3}
                    />
                  ) : null}
                </XStack>
                <MyText
                  flex={1}
                  fontSize={moderateScale(14)}
                  weight="500"
                  color={themeColors.dark.onSurface}
                >
                  Save this for future downloads
                </MyText>
              </XStack>
            </Pressable>
          ) : null}

          <XStack gap={scale(12)}>
            <Dialog.Close asChild displayWhenAdapted={false}>
              <Button
                flex={1}
                bg={themeColors.dark.surfaceSecondary}
                size="$4"
                disabled={isSubmitting}
              >
                <MyText color={themeColors.dark.onSurface}>Cancel</MyText>
              </Button>
            </Dialog.Close>
            <Button
              flex={1}
              bg={themeColors.dark.accent}
              size="$4"
              disabled={downloadDisabled || (!selectedQuality && !allowAskEveryTime)}
              onPress={handleConfirm}
            >
              <MyText color={themeColors.dark.onAccent}>
                {isSubmitting ? "Starting…" : confirmLabel}
              </MyText>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
