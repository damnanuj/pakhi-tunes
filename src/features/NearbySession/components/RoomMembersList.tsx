import { memo } from "react";
import { Image, type ImageStyle } from "react-native";
import { Users } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import type { SessionListener } from "../types/session.types";

type RoomMembersListProps = {
  listeners: SessionListener[];
  emptyLabel?: string;
};

const avatarStyle: ImageStyle = {
  width: moderateScale(32),
  height: moderateScale(32),
  borderRadius: moderateScale(16),
};

const RoomMemberRow = memo(function RoomMemberRow({
  listener,
}: {
  listener: SessionListener;
}) {
  return (
    <XStack items="center" gap={scale(10)}>
      {listener.avatar ? (
        <Image
          source={{ uri: listener.avatar }}
          style={avatarStyle}
          resizeMode="cover"
        />
      ) : (
        <YStack
          width={moderateScale(32)}
          height={moderateScale(32)}
          rounded={moderateScale(16)}
          bg={themeColors.dark.surface}
          borderWidth={1}
          borderColor={themeColors.dark.borderSecondary}
          items="center"
          justify="center"
        >
          <MyText
            fontSize={moderateScale(12)}
            weight="700"
            color={themeColors.dark.accent}
          >
            {(listener.name || "?").charAt(0).toUpperCase()}
          </MyText>
        </YStack>
      )}
      <MyText
        fontSize={moderateScale(13)}
        weight="600"
        color={themeColors.dark.onSurface}
        numberOfLines={1}
        style={{ flex: 1 }}
      >
        {listener.name}
      </MyText>
    </XStack>
  );
}, (prev, next) => {
  return (
    prev.listener.userId === next.listener.userId &&
    prev.listener.name === next.listener.name &&
    prev.listener.avatar === next.listener.avatar
  );
});

function RoomMembersList({
  listeners,
  emptyLabel = "No one has joined yet",
}: RoomMembersListProps) {
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
        <MyText
          fontSize={moderateScale(13)}
          weight="700"
          color={themeColors.dark.onSurface}
        >
          Joined
        </MyText>
        <XStack items="center" gap={scale(4)}>
          <Users
            size={moderateScale(13)}
            color={themeColors.dark.textMuted}
          />
          <MyText
            fontSize={moderateScale(12)}
            weight="600"
            color={themeColors.dark.textMuted}
          >
            {listeners.length}
          </MyText>
        </XStack>
      </XStack>

      {listeners.length === 0 ? (
        <MyText
          fontSize={moderateScale(12)}
          weight="500"
          color={themeColors.dark.textMuted}
        >
          {emptyLabel}
        </MyText>
      ) : (
        <YStack gap={verticalScale(8)}>
          {listeners.map((listener) => (
            <RoomMemberRow key={listener.userId} listener={listener} />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

export default memo(RoomMembersList);
