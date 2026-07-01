import React from "react";
import { AlertDialog, Button, XStack, YStack } from "tamagui";
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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation={DIALOG_OVERLAY_ANIMATION}
          opacity={DIALOG_OVERLAY_OPACITY}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
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
            <AlertDialog.Title>
              <MyText
                fontSize={moderateScale(18)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                {title}
              </MyText>
            </AlertDialog.Title>
            {subtitle ? (
              <MyText
                fontSize={moderateScale(15)}
                weight="600"
                color={themeColors.dark.onSurface}
              >
                {subtitle}
              </MyText>
            ) : null}
            <AlertDialog.Description>
              <MyText
                fontSize={moderateScale(14)}
                weight="400"
                color={themeColors.dark.textMuted}
              >
                {message}
              </MyText>
            </AlertDialog.Description>
          </YStack>

          <XStack gap={scale(12)}>
            <AlertDialog.Cancel asChild>
              <Button
                flex={1}
                bg={themeColors.dark.surfaceSecondary}
                size="$4"
              >
                <MyText color={themeColors.dark.onSurface} numberOfLines={1}>
                  {cancelLabel}
                </MyText>
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onPress={onConfirm}>
              <Button flex={1} bg={themeColors.dark.accent} size="$4">
                <MyText color={themeColors.dark.onAccent} numberOfLines={1}>
                  {confirmLabel}
                </MyText>
              </Button>
            </AlertDialog.Action>
          </XStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
