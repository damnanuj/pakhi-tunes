import { useCallback, useState } from "react";
import { AudioLines, ChevronRight } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import { XStack } from "tamagui";
import { moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import {
  useSetStreamQuality,
  useStreamQuality,
} from "src/features/Player/store/streamQualityStore";
import type { StreamQuality } from "src/features/Player/constants/streamQualityOptions";
import { getStreamQualityLabel } from "src/features/Player/constants/streamQualityOptions";
import ProfileMenuItem from "./ProfileMenuItem";
import StreamQualityDialog from "./StreamQualityDialog";

export default function ProfileStreamQualityItem() {
  const quality = useStreamQuality();
  const setQuality = useSetStreamQuality();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirm = useCallback(
    (next: StreamQuality) => {
      setQuality(next);
    },
    [setQuality]
  );

  return (
    <>
      <ProfileMenuItem
        icon={<AudioLines size={18} color={themeColors.dark.onSurface} />}
        label="Audio quality"
        onPress={() => setDialogOpen(true)}
        trailing={
          <XStack items="center" gap={4}>
            <MyText
              fontSize={moderateScale(13)}
              weight="500"
              color={themeColors.dark.textMuted}
            >
              {getStreamQualityLabel(quality)}
            </MyText>
            <ChevronRight
              size={moderateScale(20)}
              color={themeColors.dark.onSurface}
            />
          </XStack>
        }
      />
      <StreamQualityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentQuality={quality}
        onConfirm={handleConfirm}
      />
    </>
  );
}
