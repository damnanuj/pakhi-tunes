import { Download, Heart, History, ListMusic } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import MyText from "src/components/MyText";
import {
  navigateToLibraryTab,
  type ProfileLibraryTabId,
} from "src/features/Library/utils/navigateToLibraryTab";
import ProfileMenuItem from "./ProfileMenuItem";

const SHORTCUTS: {
  tab: ProfileLibraryTabId;
  label: string;
  icon: typeof History;
}[] = [
  { tab: "recent", label: "History", icon: History },
  { tab: "favorites", label: "Favourites", icon: Heart },
  { tab: "downloads", label: "Downloads", icon: Download },
  { tab: "playlists", label: "Playlist", icon: ListMusic },
];

export default function ProfileLibraryShortcuts() {
  const router = useRouter();

  return (
    <YStack
      gap={verticalScale(12)}
      mt={verticalScale(24)}
    >
      <MyText
        fontSize={moderateScale(14)}
        weight="600"
        color={themeColors.dark.textMuted}
        px={scale(4)}
      >
        Your library
      </MyText>

      {SHORTCUTS.map(({ tab, label, icon: Icon }) => (
        <ProfileMenuItem
          key={tab}
          icon={
            <Icon size={18} color={themeColors.dark.onSurface} />
          }
          label={label}
          onPress={() => navigateToLibraryTab(router, tab)}
        />
      ))}
    </YStack>
  );
}
