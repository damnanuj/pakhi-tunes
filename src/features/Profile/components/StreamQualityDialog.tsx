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
import type { StreamQuality } from "src/features/Player/constants/streamQualityOptions";
import {
  DEFAULT_STREAM_QUALITY,
  STREAM_QUALITY_OPTIONS,
} from "src/features/Player/constants/streamQualityOptions";

interface StreamQualityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuality: StreamQuality;
  onConfirm: (quality: StreamQuality) => void;
}

export default function StreamQualityDialog({
  open,
  onOpenChange,
  currentQuality,
  onConfirm,
}: StreamQualityDialogProps) {
  const [selectedQuality, setSelectedQuality] =
    useState<StreamQuality>(currentQuality);

  useEffect(() => {
    if (open) {
      setSelectedQuality(currentQuality || DEFAULT_STREAM_QUALITY);
    }
  }, [open, currentQuality]);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedQuality);
    onOpenChange(false);
  }, [onConfirm, onOpenChange, selectedQuality]);

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
                Audio quality
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
                Used for streaming. Applies to new plays.
              </MyText>
            </Dialog.Description>
          </YStack>

          <YStack gap={verticalScale(10)}>
            {STREAM_QUALITY_OPTIONS.map((option) => {
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
          </YStack>

          <XStack gap={scale(12)}>
            <Dialog.Close asChild displayWhenAdapted={false}>
              <Button flex={1} bg={themeColors.dark.surfaceSecondary} size="$4">
                <MyText color={themeColors.dark.onSurface}>Cancel</MyText>
              </Button>
            </Dialog.Close>
            <Button
              flex={1}
              bg={themeColors.dark.accent}
              size="$4"
              onPress={handleConfirm}
            >
              <MyText color={themeColors.dark.onAccent} weight="700">
                Done
              </MyText>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
