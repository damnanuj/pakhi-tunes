import React, { useEffect } from "react";
import {
  AlertDialog,
  Button,
  XStack,
  YStack,
} from "tamagui";
import {
  BackHandler,
  Linking,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
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
import type { ReleaseSection } from "../types/appConfig.types";
import {
  hasNonEmptyText,
  normalizeReleaseSections,
} from "../utils/normalizeReleaseSections";

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  latestVersion: string;
  releaseSections: ReleaseSection[];
  downloadUrl: string;
  forceUpdate: boolean;
}

function VersionBadge({ version }: { version: string }) {
  const trimmed = version.trim();
  if (!trimmed) return null;

  return (
    <XStack
      bg={themeColors.dark.surfaceSecondary}
      px={scale(10)}
      py={verticalScale(4)}
      rounded={moderateScale(8)}
      shrink={0}
    >
      <MyText
        fontSize={moderateScale(12)}
        weight="600"
        color={themeColors.dark.onSurface}
      >
        v{trimmed}
      </MyText>
    </XStack>
  );
}

function UpdateReleaseNotes({
  sections,
  maxHeight,
}: {
  sections: ReleaseSection[];
  maxHeight: number;
}) {
  const visibleSections = normalizeReleaseSections(sections);
  if (visibleSections.length === 0) return null;

  return (
    <ScrollView
      style={{ maxHeight }}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <YStack gap={verticalScale(14)} pb={verticalScale(4)}>
        {visibleSections.map((section, index) => (
          <YStack key={`${section.title}-${index}`} gap={verticalScale(6)}>
            <MyText
              fontSize={moderateScale(14)}
              weight="700"
              color={themeColors.dark.onSurface}
            >
              {section.title}
            </MyText>
            <YStack gap={verticalScale(4)} pl={scale(4)}>
              {section.items.map((item, itemIndex) => (
                <XStack
                  key={`${section.title}-${itemIndex}-${item}`}
                  gap={scale(8)}
                  items="flex-start"
                >
                  <MyText
                    fontSize={moderateScale(14)}
                    weight="400"
                    color={themeColors.dark.textMuted}
                    mt={verticalScale(1)}
                  >
                    •
                  </MyText>
                  <MyText
                    flex={1}
                    fontSize={moderateScale(14)}
                    weight="400"
                    color={themeColors.dark.textMuted}
                  >
                    {item}
                  </MyText>
                </XStack>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  );
}

function UpdateDialogActions({
  forceUpdate,
  hasDownloadUrl,
  onDownload,
  onCloseApp,
}: {
  forceUpdate: boolean;
  hasDownloadUrl: boolean;
  onDownload: () => void;
  onCloseApp: () => void;
}) {
  if (forceUpdate) {
    return (
      <YStack gap={verticalScale(12)} width="100%">
        {hasDownloadUrl ? (
          <AlertDialog.Action asChild onPress={onDownload}>
            <Button width="100%" bg={themeColors.dark.accent} size="$4">
              <MyText color={themeColors.dark.onAccent} numberOfLines={1}>
                Download
              </MyText>
            </Button>
          </AlertDialog.Action>
        ) : null}
        <Button width="100%" bg="#dc2626" size="$4" onPress={onCloseApp}>
          <MyText color="#FFFFFF" numberOfLines={1}>
            Close app
          </MyText>
        </Button>
      </YStack>
    );
  }

  return (
    <XStack gap={scale(12)}>
      <AlertDialog.Cancel asChild>
        <Button flex={1} bg={themeColors.dark.surfaceSecondary} size="$4">
          <MyText color={themeColors.dark.onSurface} numberOfLines={1}>
            Cancel
          </MyText>
        </Button>
      </AlertDialog.Cancel>
      {hasDownloadUrl ? (
        <AlertDialog.Action asChild onPress={onDownload}>
          <Button flex={1} bg={themeColors.dark.accent} size="$4">
            <MyText color={themeColors.dark.onAccent} numberOfLines={1}>
              Download
            </MyText>
          </Button>
        </AlertDialog.Action>
      ) : null}
    </XStack>
  );
}

export default function UpdateDialog({
  open,
  onOpenChange,
  title,
  message,
  latestVersion,
  releaseSections,
  downloadUrl,
  forceUpdate,
}: UpdateDialogProps) {
  const { height: windowHeight } = useWindowDimensions();
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();
  const trimmedVersion = latestVersion.trim();
  const hasDownloadUrl = hasNonEmptyText(downloadUrl);
  const hasTitle = hasNonEmptyText(trimmedTitle);
  const hasMessage = hasNonEmptyText(trimmedMessage);
  const hasVersion = hasNonEmptyText(trimmedVersion);
  const visibleReleaseSections = normalizeReleaseSections(releaseSections);
  const hasReleaseNotes = visibleReleaseSections.length > 0;
  const hasHeader = hasTitle || hasVersion || hasMessage;
  const scrollMaxHeight = windowHeight * 0.45;

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

  const handleCloseApp = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
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
          maxH={windowHeight * 0.85}
          overflow="hidden"
        >
          {hasHeader ? (
            <YStack gap={verticalScale(8)} shrink={0}>
              {hasTitle || hasVersion ? (
                <XStack
                  justify={hasTitle ? "space-between" : "flex-end"}
                  items="center"
                  gap={scale(12)}
                  width="100%"
                >
                  {hasTitle ? (
                    <AlertDialog.Title flex={1}>
                      <MyText
                        fontSize={moderateScale(18)}
                        weight="700"
                        color={themeColors.dark.onSurface}
                      >
                        {trimmedTitle}
                      </MyText>
                    </AlertDialog.Title>
                  ) : null}
                  {hasVersion ? <VersionBadge version={trimmedVersion} /> : null}
                </XStack>
              ) : null}
              {hasMessage ? (
                <AlertDialog.Description>
                  <MyText
                    fontSize={moderateScale(14)}
                    weight="400"
                    color={themeColors.dark.textMuted}
                  >
                    {trimmedMessage}
                  </MyText>
                </AlertDialog.Description>
              ) : null}
            </YStack>
          ) : null}

          {hasReleaseNotes ? (
            <UpdateReleaseNotes
              sections={visibleReleaseSections}
              maxHeight={scrollMaxHeight}
            />
          ) : null}

          <UpdateDialogActions
            forceUpdate={forceUpdate}
            hasDownloadUrl={hasDownloadUrl}
            onDownload={() => void handleDownload()}
            onCloseApp={handleCloseApp}
          />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
