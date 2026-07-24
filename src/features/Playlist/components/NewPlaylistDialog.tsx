import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  YStack,
  XStack,
} from "tamagui";
import {
  Image,
  Pressable,
  ScrollView,
  View,
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
import { useDismissOnBack } from "src/hooks/useDismissOnBack";
import {
  PLAYLIST_COVER_URLS,
} from "../constants/playlistCovers";

interface NewPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, coverUrl: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_COVER_URL = PLAYLIST_COVER_URLS[0];

export default function NewPlaylistDialog({
  open,
  onOpenChange,
  onCreate,
  isSubmitting = false,
}: NewPlaylistDialogProps) {
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER_URL);
  const wasOpenRef = useRef(false);

  useDismissOnBack(open, () => onOpenChange(false));

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setTitle("");
      setCoverUrl(DEFAULT_COVER_URL);
    }
    wasOpenRef.current = open;
  }, [open]);

  const canCreate = title.trim().length > 0 && !isSubmitting;

  const handleCreate = useCallback(() => {
    if (!canCreate) return;
    void onCreate(title.trim(), coverUrl);
  }, [canCreate, coverUrl, onCreate, title]);

  const coverOptions = useMemo(() => [...PLAYLIST_COVER_URLS], []);

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
          maxW={scale(360)}
        >
          <Dialog.Title
            p={0}
            m={0}
            fontSize={moderateScale(18)}
            lineHeight={moderateScale(18)}
          >
            <MyText
              fontSize={moderateScale(18)}
              lineHeight={moderateScale(18)}
              weight="700"
              color={themeColors.dark.onSurface}
            >
              New Playlist
            </MyText>
          </Dialog.Title>

          <YStack gap={verticalScale(8)}>
            <MyText
              fontSize={moderateScale(13)}
              weight="600"
              color={themeColors.dark.textMuted}
            >
              Title
            </MyText>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="My playlist"
              placeholderTextColor={themeColors.dark.textMuted}
              autoFocus
              bg={themeColors.dark.surfaceSecondary}
              borderColor={themeColors.dark.borderSecondary}
              color={themeColors.dark.onSurface}
              rounded={moderateScale(12)}
              height={verticalScale(44)}
              fontSize={moderateScale(15)}
            />
          </YStack>

          <YStack gap={verticalScale(8)}>
            <MyText
              fontSize={moderateScale(13)}
              weight="600"
              color={themeColors.dark.textMuted}
            >
              Cover
            </MyText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: scale(10) }}
            >
              {coverOptions.map((url) => {
                const isSelected = url === coverUrl;
                return (
                  <Pressable
                    key={url}
                    onPress={() => setCoverUrl(url)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={{
                        width: moderateScale(64),
                        height: moderateScale(64),
                        borderRadius: moderateScale(12),
                        overflow: "hidden",
                        borderWidth: 2,
                        borderColor: isSelected
                          ? themeColors.dark.accent
                          : "transparent",
                      }}
                    >
                      <Image
                        source={{ uri: url }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </YStack>

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
              bg={
                canCreate
                  ? themeColors.dark.accent
                  : themeColors.dark.surfaceSecondary
              }
              size="$4"
              disabled={!canCreate}
              opacity={canCreate ? 1 : 0.5}
              onPress={handleCreate}
            >
              <MyText
                color={
                  canCreate
                    ? themeColors.dark.onAccent
                    : themeColors.dark.textMuted
                }
              >
                {isSubmitting ? "Creating…" : "Create"}
              </MyText>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
