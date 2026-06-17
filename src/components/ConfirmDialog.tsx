import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button, XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <YStack
          bg={themeColors.dark.surface}
          mx={scale(24)}
          p={scale(20)}
          gap={verticalScale(16)}
          rounded={moderateScale(16)}
          width="100%"
          maxW={scale(340)}
        >
          <YStack gap={verticalScale(8)}>
            <MyText
              fontSize={moderateScale(18)}
              weight="700"
              color={themeColors.dark.onSurface}
            >
              {title}
            </MyText>
            <MyText
              fontSize={moderateScale(14)}
              weight="400"
              color={themeColors.dark.textMuted}
            >
              {message}
            </MyText>
          </YStack>

          <XStack gap={scale(12)}>
            <Button
              flex={1}
              bg={themeColors.dark.surfaceSecondary}
              size="$4"
              onPress={onCancel}
            >
              <MyText color={themeColors.dark.onSurface}>{cancelLabel}</MyText>
            </Button>
            <Button
              flex={1}
              bg={themeColors.dark.accent}
              size="$4"
              onPress={onConfirm}
            >
              <MyText color={themeColors.dark.onAccent}>{confirmLabel}</MyText>
            </Button>
          </XStack>
        </YStack>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: scale(24),
  },
});
