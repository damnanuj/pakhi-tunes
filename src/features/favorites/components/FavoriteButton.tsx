import { Pressable } from "react-native";
import { Heart } from "@tamagui/lucide-icons";
import { moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import type { ActiveTrack } from "src/features/Player/types";
import { useFavoriteSongIds } from "../hooks/useFavorites";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

type FavoriteButtonProps = {
  track: ActiveTrack | null;
  redirectPath?: string;
  size?: number;
};

export default function FavoriteButton({
  track,
  redirectPath = "/player",
  size = moderateScale(20),
}: FavoriteButtonProps) {
  const { isFavorited } = useFavoriteSongIds();
  const { toggleFavorite, isPending } = useToggleFavorite(redirectPath);

  if (!track) return null;

  const favorited = isFavorited(track.id);

  return (
    <Pressable
      onPress={() => {
        void toggleFavorite(track, favorited);
      }}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityLabel={favorited ? "Remove from favourites" : "Add to favourites"}
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <Heart
        size={size}
        color={favorited ? themeColors.dark.accent : themeColors.dark.onSurface}
        fill={favorited ? themeColors.dark.accent : "transparent"}
      />
    </Pressable>
  );
}
