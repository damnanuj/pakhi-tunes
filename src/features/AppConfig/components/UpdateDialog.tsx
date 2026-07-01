import React, { useEffect } from "react";
import { AlertDialog, Button, XStack, YStack } from "tamagui";
import { BackHandler, Linking } from "react-native";
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

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  downloadUrl: string;
  forceUpdate: boolean;
}

export default function UpdateDialog({
  open,
  onOpenChange,
  title,
  message,
  downloadUrl,
  forceUpdate,
}: UpdateDialogProps) {
  const hasDownloadUrl = Boolean(downloadUrl?.trim());

  useEffect(() => {
    if (!open || !forceUpdate) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );

    return () => subscription.remove();
  }, [open, forceUpdate]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (forceUpdate) return;
    onOpenChange(nextOpen);
  };

  const handleDownload = async () => {
    if (!hasDownloadUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(downloadUrl);
      if (canOpen) {
        await Linking.openURL(downloadUrl);
      }
    } catch {
      // Ignore link open failures.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
            {!forceUpdate ? (
              <AlertDialog.Cancel asChild>
                <Button
                  flex={1}
                  bg={themeColors.dark.surfaceSecondary}
                  size="$4"
                >
                  <MyText color={themeColors.dark.onSurface}>Cancel</MyText>
                </Button>
              </AlertDialog.Cancel>
            ) : null}
            <AlertDialog.Action asChild onPress={handleDownload}>
              <Button
                flex={1}
                bg={themeColors.dark.accent}
                size="$4"
                disabled={!hasDownloadUrl}
                opacity={hasDownloadUrl ? 1 : 0.5}
              >
                <MyText color={themeColors.dark.onAccent}>Download</MyText>
              </Button>
            </AlertDialog.Action>
          </XStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
