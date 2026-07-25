import { memo, useCallback } from "react";
import { Image, Pressable, type ImageStyle, type ViewStyle } from "react-native";
import { ListMusic } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import type { SessionQueueTrack } from "../types/session.types";

type RoomQueueListProps = {
  queue: SessionQueueTrack[];
  /** When set, rows are pressable (host play-now). */
  onPlayItem?: (item: SessionQueueTrack) => void;
};

const artworkStyle: ImageStyle = {
  width: moderateScale(40),
  height: moderateScale(40),
  borderRadius: moderateScale(8),
};

const pressOpacityStyle = ({ pressed }: { pressed: boolean }): ViewStyle => ({
  opacity: pressed ? 0.75 : 1,
});

type RoomQueueRowProps = {
  item: SessionQueueTrack;
  index: number;
  onPlayItem?: (item: SessionQueueTrack) => void;
};

const RoomQueueRow = memo(function RoomQueueRow({
  item,
  index,
  onPlayItem,
}: RoomQueueRowProps) {
  const isNext = index === 0;
  const title = decodeHtmlEntities(item.title);
  const artist = decodeHtmlEntities(item.artist);
  const addedBy = item.addedBy?.name?.trim() || "Listener";

  const handlePress = useCallback(() => {
    onPlayItem?.(item);
  }, [item, onPlayItem]);

  const row = (
    <XStack
      items="center"
      gap={scale(10)}
      py={verticalScale(8)}
      px={scale(8)}
      rounded={moderateScale(12)}
      bg={isNext ? themeColors.dark.surface : "transparent"}
      borderWidth={isNext ? 1 : 0}
      borderColor={isNext ? themeColors.dark.accent : "transparent"}
    >
      {item.artworkUrl ? (
        <Image
          source={{ uri: item.artworkUrl }}
          style={artworkStyle}
          resizeMode="cover"
        />
      ) : (
        <YStack
          width={moderateScale(40)}
          height={moderateScale(40)}
          rounded={moderateScale(8)}
          bg={themeColors.dark.surface}
          items="center"
          justify="center"
        >
          <ListMusic
            size={moderateScale(16)}
            color={themeColors.dark.textMuted}
          />
        </YStack>
      )}

      <YStack flex={1} gap={verticalScale(2)}>
        <XStack items="center" gap={scale(6)}>
          <MyText
            fontSize={moderateScale(13)}
            weight="700"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {title}
          </MyText>
          {isNext ? (
            <MyText
              fontSize={moderateScale(10)}
              weight="700"
              color={themeColors.dark.accent}
            >
              Next
            </MyText>
          ) : null}
        </XStack>
        <MyText
          fontSize={moderateScale(11)}
          weight="500"
          color={themeColors.dark.textMuted}
          numberOfLines={1}
        >
          {artist}
        </MyText>
        <MyText
          fontSize={moderateScale(10)}
          weight="500"
          color={themeColors.dark.textMuted}
          numberOfLines={1}
        >
          Added by {addedBy}
        </MyText>
      </YStack>

      {!isNext ? (
        <MyText
          fontSize={moderateScale(12)}
          weight="700"
          color={themeColors.dark.textMuted}
        >
          {index + 1}
        </MyText>
      ) : null}
    </XStack>
  );

  if (!onPlayItem) {
    return row;
  }

  return (
    <Pressable onPress={handlePress} style={pressOpacityStyle}>
      {row}
    </Pressable>
  );
}, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.onPlayItem === next.onPlayItem &&
    prev.item.queueItemId === next.item.queueItemId &&
    prev.item.songId === next.item.songId &&
    prev.item.title === next.item.title &&
    prev.item.artist === next.item.artist &&
    prev.item.artworkUrl === next.item.artworkUrl &&
    prev.item.addedBy?.name === next.item.addedBy?.name
  );
});

function RoomQueueList({ queue, onPlayItem }: RoomQueueListProps) {
  const canPlayNow = Boolean(onPlayItem);

  return (
    <YStack
      gap={verticalScale(10)}
      py={verticalScale(14)}
      px={scale(14)}
      rounded={moderateScale(16)}
      bg={themeColors.dark.surfaceSecondary}
      borderWidth={1}
      borderColor={themeColors.dark.borderSecondary}
    >
      <XStack items="center" justify="space-between">
        <XStack items="center" gap={scale(6)}>
          <ListMusic
            size={moderateScale(14)}
            color={themeColors.dark.onSurface}
          />
          <MyText
            fontSize={moderateScale(13)}
            weight="700"
            color={themeColors.dark.onSurface}
          >
            Up next
          </MyText>
        </XStack>
        <MyText
          fontSize={moderateScale(12)}
          weight="600"
          color={themeColors.dark.textMuted}
        >
          {queue.length}
        </MyText>
      </XStack>

      {queue.length === 0 ? (
        <MyText
          fontSize={moderateScale(12)}
          weight="500"
          color={themeColors.dark.textMuted}
        >
          Songs your friends choose will appear here.
        </MyText>
      ) : (
        <YStack gap={verticalScale(8)}>
          {canPlayNow ? (
            <MyText
              fontSize={moderateScale(11)}
              weight="500"
              color={themeColors.dark.textMuted}
            >
              Tap a song to play it now
            </MyText>
          ) : null}
          {queue.map((item, index) => (
            <RoomQueueRow
              key={item.queueItemId || `${item.songId}-${index}`}
              item={item}
              index={index}
              onPlayItem={onPlayItem}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

export default memo(RoomQueueList);
