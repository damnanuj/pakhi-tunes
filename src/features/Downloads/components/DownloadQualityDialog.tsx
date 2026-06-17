import { useCallback, useState } from "react";
import { Pressable, type PressableStateCallbackType } from "react-native";
import { Dialog, Button, YStack, XStack, RadioGroup } from "tamagui";
import { Check } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { DownloadQuality } from "../types/download.types";
import { DOWNLOAD_QUALITY_OPTIONS } from "../types/download.types";

interface DownloadQualityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quality: DownloadQuality) => void;
  isSubmitting?: boolean;
}

export default function DownloadQualityDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: DownloadQualityDialogProps) {
  const [selectedQuality, setSelectedQuality] =
    useState<DownloadQuality>("160kbps");

  const handleConfirm = useCallback(() => {
    onConfirm(selectedQuality);
  }, [onConfirm, selectedQuality]);

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.6}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          bordered
          elevate
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          bg={themeColors.dark.surface}
          p={scale(20)}
          gap={verticalScale(16)}
          rounded={moderateScale(16)}
          width="90%"
          maxW={scale(340)}
        >
          <YStack gap={verticalScale(8)}>
            <Dialog.Title>
              <MyText
                fontSize={moderateScale(18)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                Download song
              </MyText>
            </Dialog.Title>
            <Dialog.Description>
              <MyText
                fontSize={moderateScale(14)}
                weight="400"
                color={themeColors.dark.textMuted}
              >
                Choose audio quality for offline listening
              </MyText>
            </Dialog.Description>
          </YStack>

          <RadioGroup
            value={selectedQuality}
            onValueChange={(value) =>
              setSelectedQuality(value as DownloadQuality)
            }
            gap={verticalScale(10)}
          >
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
                    <RadioGroup.Item
                      value={option.quality}
                      id={option.quality}
                      size="$3"
                      borderColor={
                        isSelected
                          ? themeColors.dark.accent
                          : themeColors.dark.borderSecondary
                      }
                    >
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <YStack flex={1} gap={verticalScale(2)}>
                      <MyText
                        fontSize={moderateScale(15)}
                        weight="700"
                        color={themeColors.dark.onSurface}
                      >
                        {option.label} ({option.quality})
                      </MyText>
                      <MyText
                        fontSize={moderateScale(12)}
                        weight="400"
                        color={themeColors.dark.textMuted}
                      >
                        {option.subtitle}
                      </MyText>
                    </YStack>
                  </XStack>
                </Pressable>
              );
            })}
          </RadioGroup>

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
              disabled={isSubmitting}
              onPress={handleConfirm}
              icon={isSubmitting ? undefined : Check}
            >
              <MyText color={themeColors.dark.onAccent}>
                {isSubmitting ? "Starting…" : "Download"}
              </MyText>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
