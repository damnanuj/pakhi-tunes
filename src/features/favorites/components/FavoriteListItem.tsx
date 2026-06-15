import { useCallback } from "react";
import { Image, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import { Play } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import type { FavoriteSong } from "../types/favorites.types";
import { favoriteToActiveTrack } from "../types/favorites.types";

type FavoriteListItemProps = {
  favorite: FavoriteSong;
};

export default function FavoriteListItem({ favorite }: FavoriteListItemProps) {
  const { playActiveTrack, togglePlayPause } = usePlayback();
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isActive = activeTrack?.id === favorite.songId;

  const handlePress = useCallback(() => {
    if (isActive) {
      void togglePlayPause();
      return;
    }

    const track = favoriteToActiveTrack(favorite);
    if (!track) return;
    void playActiveTrack(track);
  }, [favorite, isActive, playActiveTrack, togglePlayPause]);

  return (
    <Pressable onPress={handlePress}>
      <XStack
        items="center"
        gap={scale(12)}
        py={verticalScale(10)}
        borderBottomWidth={1}
        borderColor="rgba(255,255,255,0.08)"
      >
        {favorite.artworkUrl ? (
          <Image
            source={{ uri: favorite.artworkUrl }}
            style={{
              width: moderateScale(52),
              height: moderateScale(52),
              borderRadius: moderateScale(8),
            }}
          />
        ) : (
          <YStack
            width={moderateScale(52)}
            height={moderateScale(52)}
            bg={themeColors.dark.surfaceSecondary}
            rounded={moderateScale(8)}
          />
        )}

        <YStack flex={1} gap={verticalScale(2)}>
          <MyText
            fontSize={moderateScale(15)}
            weight="600"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {favorite.title}
          </MyText>
          <MyText
            fontSize={moderateScale(13)}
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            {favorite.artist}
          </MyText>
        </YStack>

        <Play
          size={moderateScale(18)}
          color={themeColors.dark.onSurface}
          fill={isActive && isPlaying ? themeColors.dark.onSurface : "transparent"}
        />
      </XStack>
    </Pressable>
  );
}
