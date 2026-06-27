import { Image, Pressable } from "react-native";
import { Headphones, Users } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale, verticalScale } from "src/utils/functions/dimensions";
import type { NearbySession } from "../types/session.types";

type NearbySessionCardProps = {
  session: NearbySession;
  onJoin: (session: NearbySession) => void;
  onLeave?: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  isActiveSession?: boolean;
};

function formatDistance(meters?: number) {
  if (meters === undefined) return "";
  if (meters < 1000) return `${meters} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export default function NearbySessionCard({
  session,
  onJoin,
  onLeave,
  isJoining = false,
  isLeaving = false,
  isActiveSession = false,
}: NearbySessionCardProps) {
  const isLeaveMode = isActiveSession;
  const isBusy = isJoining || isLeaving;

  const buttonLabel = isLeaveMode
    ? isLeaving
      ? "Leaving..."
      : "Leave Session"
    : isJoining
      ? "Joining..."
      : "Join Session";

  return (
    <YStack
      bg={themeColors.dark.surfaceSecondary}
      rounded={moderateScale(16)}
      p={scale(14)}
      gap={verticalScale(12)}
      borderWidth={1}
      borderColor={
        isActiveSession
          ? themeColors.dark.accent
          : themeColors.dark.borderSecondary
      }
    >
      <XStack items="center" gap={scale(12)}>
        <YStack
          width={moderateScale(44)}
          height={moderateScale(44)}
          rounded={moderateScale(22)}
          bg={themeColors.dark.surface}
          items="center"
          justify="center"
          overflow="hidden"
        >
          {session.hostAvatar ? (
            <Image
              source={{ uri: session.hostAvatar }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Headphones
              size={moderateScale(20)}
              color={themeColors.dark.accent}
            />
          )}
        </YStack>

        <YStack flex={1} style={{ gap: verticalScale(2) }}>
          <MyText
            fontSize={moderateScale(15)}
            weight="700"
            color={themeColors.dark.onSurface}
          >
            {session.hostName}
          </MyText>
          <MyText
            fontSize={moderateScale(12)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            {formatDistance(session.distanceMeters)}
          </MyText>
        </YStack>

        <XStack items="center" gap={scale(4)}>
          <Users size={moderateScale(14)} color={themeColors.dark.textMuted} />
          <MyText
            fontSize={moderateScale(12)}
            weight="600"
            color={themeColors.dark.textMuted}
          >
            {session.listenerCount}
          </MyText>
        </XStack>
      </XStack>

      <XStack items="center" gap={scale(12)}>
        <Image
          source={{ uri: session.trackArtwork }}
          style={{
            width: moderateScale(52),
            height: moderateScale(52),
            borderRadius: moderateScale(8),
            backgroundColor: themeColors.dark.surface,
          }}
        />
        <YStack flex={1} style={{ gap: verticalScale(2) }}>
          <MyText
            fontSize={moderateScale(14)}
            weight="700"
            color={themeColors.dark.onSurface}
            numberOfLines={1}
          >
            {session.trackTitle}
          </MyText>
          <MyText
            fontSize={moderateScale(12)}
            weight="500"
            color={themeColors.dark.textMuted}
            numberOfLines={1}
          >
            {session.trackArtist}
          </MyText>
        </YStack>
      </XStack>

      <Pressable
        onPress={() => (isLeaveMode ? onLeave?.() : onJoin(session))}
        disabled={isBusy}
        style={{
          backgroundColor: isLeaveMode
            ? "transparent"
            : themeColors.dark.accent,
          borderRadius: moderateScale(12),
          paddingVertical: verticalScale(12),
          alignItems: "center",
          borderWidth: isLeaveMode ? 1 : 0,
          borderColor: isLeaveMode
            ? themeColors.dark.borderSecondary
            : "transparent",
          opacity: isBusy ? 0.7 : 1,
        }}
      >
        <MyText
          fontSize={moderateScale(14)}
          weight="700"
          color={
            isLeaveMode
              ? themeColors.dark.accent
              : themeColors.dark.onAccent
          }
        >
          {buttonLabel}
        </MyText>
      </Pressable>
    </YStack>
  );
}
