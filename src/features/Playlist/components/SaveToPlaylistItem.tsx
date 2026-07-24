import { memo, useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import { Check } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { getPlaylistCoverUrl } from "../constants/playlistCovers";

const COVER_SIZE = moderateScale(48);
const COVER_RADIUS = moderateScale(8);

export interface SaveToPlaylistItemProps {
  id: string;
  name: string;
  coverUrl?: string;
  songCount: number;
  selected: boolean;
  onToggle: (id: string) => void;
}

function SaveToPlaylistItem({
  id,
  name,
  coverUrl,
  songCount,
  selected,
  onToggle,
}: SaveToPlaylistItemProps) {
  const imageUrl = useMemo(
    () => getPlaylistCoverUrl(coverUrl, id),
    [coverUrl, id]
  );

  return (
    <Pressable
      onPress={() => onToggle(id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(20),
        backgroundColor: pressed ? "rgba(255, 255, 255, 0.06)" : "transparent",
      })}
    >
      <View
        style={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          borderRadius: COVER_RADIUS,
          overflow: "hidden",
          backgroundColor: themeColors.dark.surfaceSecondary,
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: COVER_SIZE, height: COVER_SIZE }}
          resizeMode="cover"
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <MyText
          fontSize={moderateScale(15)}
          weight="600"
          color={themeColors.dark.onSurface}
          numberOfLines={1}
        >
          {name}
        </MyText>
        <MyText
          fontSize={moderateScale(12)}
          weight="400"
          color={themeColors.dark.textMuted}
          numberOfLines={1}
          style={{ marginTop: verticalScale(2) }}
        >
          {songCount === 1 ? "1 song" : `${songCount} songs`}
        </MyText>
      </View>
      <View
        style={{
          width: moderateScale(24),
          height: moderateScale(24),
          borderRadius: moderateScale(12),
          borderWidth: 2,
          borderColor: selected
            ? themeColors.dark.accent
            : themeColors.dark.borderSecondary,
          backgroundColor: selected ? themeColors.dark.accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? (
          <Check
            size={moderateScale(14)}
            color={themeColors.dark.onAccent}
            strokeWidth={3}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(SaveToPlaylistItem);
