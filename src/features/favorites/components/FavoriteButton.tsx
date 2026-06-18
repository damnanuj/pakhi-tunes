import { Pressable, type PressableStateCallbackType } from "react-native";
import { Heart } from "@tamagui/lucide-icons";
import { moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { ActiveTrack } from "src/features/Player/types";
import {
  ghostControlStyle,
  playerRippleLight,
} from "src/features/Player/utils/ghostControlStyle";
import { activeTrackToFavoritePayload } from "../types/favorites.types";
import { useFavoriteStatus } from "../hooks/useFavoriteStatus";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

type FavoriteButtonProps = {
  track: ActiveTrack | null;
  size?: number;
};

export default function FavoriteButton({
  track,
  size = moderateScale(20),
}: FavoriteButtonProps) {
  const { isFavorited: favorited, isLoading: isStatusLoading } =
    useFavoriteStatus(track?.id);
  const { toggleFavorite, isPending } = useToggleFavorite();

  if (!track) return null;

  return (
    <Pressable
      onPress={() => {
        void toggleFavorite(activeTrackToFavoritePayload(track), favorited);
      }}
      disabled={isPending || isStatusLoading}
      accessibilityRole="button"
      accessibilityLabel={favorited ? "Remove from favourites" : "Add to favourites"}
      android_ripple={isPending ? undefined : playerRippleLight}
      style={({ pressed }: PressableStateCallbackType) => ({
        ...ghostControlStyle(pressed && !isPending && !isStatusLoading),
        opacity: isPending || isStatusLoading ? 0.6 : 1,
      })}
    >
      <Heart
        size={size}
        color={favorited ? themeColors.dark.accent : themeColors.dark.onSurface}
        fill={favorited ? themeColors.dark.accent : "transparent"}
      />
    </Pressable>
  );
}
