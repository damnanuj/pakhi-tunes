import React from "react";
import { AlertDialog, Button, XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
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
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
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
          animation="quick"
          opacity={0.6}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
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
            <AlertDialog.Title>
              <MyText
                fontSize={moderateScale(18)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                {title}
              </MyText>
            </AlertDialog.Title>
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
                <MyText color={themeColors.dark.onSurface}>
                  {cancelLabel}
                </MyText>
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onPress={onConfirm}>
              <Button flex={1} bg={themeColors.dark.accent} size="$4">
                <MyText color={themeColors.dark.onAccent}>
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
