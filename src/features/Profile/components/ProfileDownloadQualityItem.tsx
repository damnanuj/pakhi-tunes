import { useCallback, useState } from "react";
import { Download, ChevronRight } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import { XStack } from "tamagui";
import { moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import DownloadQualityDialog from "src/features/Downloads/components/DownloadQualityDialog";
import { getDownloadQualityLabel } from "src/features/Downloads/types/download.types";
import type { DownloadQuality } from "src/features/Downloads/types/download.types";
import { useDownloadQuality } from "src/features/Player/store/streamQualityStore";
import { setDownloadQualityPreference } from "src/features/Player/store/playbackPreferences";
import ProfileMenuItem from "./ProfileMenuItem";

export default function ProfileDownloadQualityItem() {
  const quality = useDownloadQuality();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirm = useCallback((next: DownloadQuality) => {
    setDownloadQualityPreference(next);
  }, []);

  const handleAskEveryTime = useCallback(() => {
    setDownloadQualityPreference(null);
  }, []);

  return (
    <>
      <ProfileMenuItem
        icon={<Download size={18} color={themeColors.dark.onSurface} />}
        label="Download quality"
        onPress={() => setDialogOpen(true)}
        trailing={
          <XStack items="center" gap={4}>
            <MyText
              fontSize={moderateScale(13)}
              weight="500"
              color={themeColors.dark.textMuted}
            >
              {getDownloadQualityLabel(quality)}
            </MyText>
            <ChevronRight
              size={moderateScale(20)}
              color={themeColors.dark.onSurface}
            />
          </XStack>
        }
      />
      <DownloadQualityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentQuality={quality}
        showRememberCheckbox={false}
        allowAskEveryTime
        title="Download quality"
        description="Used the next time you download a song."
        confirmLabel="Done"
        onConfirm={handleConfirm}
        onAskEveryTime={handleAskEveryTime}
      />
    </>
  );
}
