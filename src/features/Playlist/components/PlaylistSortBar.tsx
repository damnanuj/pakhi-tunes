import { memo, useCallback, useRef } from "react";
import { Pressable, View } from "react-native";
import { XStack } from "tamagui";
import { ArrowDownUp } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { MenuAnchor } from "src/features/ArtistSongs/components/SongOptionsMenu";
import type { PlaylistSongSort } from "../types/playlist.types";
import { getPlaylistSortLabel } from "../constants/playlistSortOptions";

interface PlaylistSortBarProps {
  activeSort: PlaylistSongSort;
  onOpenMenu: (anchor: MenuAnchor) => void;
}

function PlaylistSortBar({ activeSort, onOpenMenu }: PlaylistSortBarProps) {
  const triggerRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      onOpenMenu({ x, y, width, height });
    });
  }, [onOpenMenu]);

  return (
    <XStack
      px={scale(20)}
      pb={verticalScale(10)}
      items="center"
      justify="space-between"
    >
      <MyText
        fontSize={moderateScale(15)}
        weight="700"
        color={themeColors.dark.onSurface}
      >
        Songs
      </MyText>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={handlePress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Sort songs"
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: scale(6),
            paddingVertical: verticalScale(6),
            paddingHorizontal: scale(12),
            borderRadius: moderateScale(18),
            backgroundColor: pressed
              ? "rgba(255,255,255,0.12)"
              : themeColors.dark.surfaceSecondary,
          })}
        >
          <ArrowDownUp
            size={moderateScale(15)}
            color={themeColors.dark.onSurface}
          />
          <MyText
            fontSize={moderateScale(13)}
            weight="600"
            color={themeColors.dark.onSurface}
          >
            {getPlaylistSortLabel(activeSort)}
          </MyText>
        </Pressable>
      </View>
    </XStack>
  );
}

export default memo(PlaylistSortBar);
