import { useCallback, useState } from "react";
import { Pressable, ScrollView, Share } from "react-native";
import { Copy, DoorOpen, Hash, Share2, Users } from "@tamagui/lucide-icons";
import { Input, XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import { appToast } from "src/components/toast/appToastHelpers";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import NearbySessionCard from "./NearbySessionCard";
import { useNearbySessionActions } from "../providers/NearbySessionProvider";
import { useNearbySessionStore } from "../store/nearbySessionStore";

type PrivateRoomPanelProps = {
  bottomPadding: number;
};

export default function PrivateRoomPanel({
  bottomPadding,
}: PrivateRoomPanelProps) {
  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const role = useNearbySessionStore((s) => s.role);
  const roomCode = useNearbySessionStore((s) => s.roomCode);
  const activeSession = useNearbySessionStore((s) => s.activeSession);
  const listenerCount = useNearbySessionStore((s) => s.listenerCount);

  const { createRoom, stopRoom, joinByCode, leaveSession } =
    useNearbySessionActions();

  const [codeInput, setCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isHostingPrivate = role === "host" && Boolean(roomCode);
  const isListeningPrivate =
    role === "listener" && activeSession?.visibility === "private";

  const handleCreateRoom = useCallback(async () => {
    setIsCreating(true);
    try {
      await createRoom();
    } finally {
      setIsCreating(false);
    }
  }, [createRoom]);

  const handleJoinByCode = useCallback(async () => {
    setIsJoining(true);
    try {
      const joined = await joinByCode(codeInput);
      if (joined) {
        setCodeInput("");
      }
    } finally {
      setIsJoining(false);
    }
  }, [codeInput, joinByCode]);

  const handleEndRoom = useCallback(async () => {
    setIsEnding(true);
    try {
      await stopRoom();
    } finally {
      setIsEnding(false);
    }
  }, [stopRoom]);

  const handleLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      await leaveSession();
    } finally {
      setIsLeaving(false);
    }
  }, [leaveSession]);

  const handleShareCode = useCallback(async () => {
    if (!roomCode) return;
    try {
      await Share.share({
        message: `Join my Pakhi Tunes room with code: ${roomCode}`,
      });
    } catch {
      /* user cancelled */
    }
  }, [roomCode]);

  const handleCopyCode = useCallback(async () => {
    if (!roomCode) return;
    try {
      await Share.share({ message: roomCode });
      appToast.info("Room code ready to share");
    } catch {
      /* user cancelled */
    }
  }, [roomCode]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: scale(20),
        paddingBottom: bottomPadding,
        gap: verticalScale(20),
      }}
    >
      <MyText
        fontSize={scale(14)}
        weight="500"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        Listen to the same song, in sync, with anyone — no matter the distance.
      </MyText>

      {isHostingPrivate && activeSession ? (
        <YStack gap={verticalScale(16)}>
          <YStack
            items="center"
            gap={verticalScale(10)}
            py={verticalScale(20)}
            px={scale(16)}
            rounded={moderateScale(18)}
            bg={themeColors.dark.surfaceSecondary}
            borderWidth={1}
            borderColor={themeColors.dark.borderSecondary}
          >
            <MyText
              fontSize={moderateScale(12)}
              weight="600"
              color={themeColors.dark.textMuted}
            >
              Your room code
            </MyText>
            <MyText
              fontSize={moderateScale(40)}
              weight="800"
              color={themeColors.dark.accent}
              style={{ letterSpacing: moderateScale(8) }}
            >
              {roomCode}
            </MyText>
            <XStack items="center" gap={scale(6)}>
              <Users
                size={moderateScale(14)}
                color={themeColors.dark.textMuted}
              />
              <MyText
                fontSize={moderateScale(13)}
                weight="600"
                color={themeColors.dark.textMuted}
              >
                {listenerCount} listener{listenerCount === 1 ? "" : "s"}
              </MyText>
            </XStack>

            <XStack gap={scale(10)} mt={verticalScale(4)}>
              <Pressable
                onPress={() => void handleCopyCode()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: scale(6),
                  paddingHorizontal: scale(14),
                  paddingVertical: verticalScale(10),
                  borderRadius: moderateScale(12),
                  backgroundColor: themeColors.dark.surface,
                  borderWidth: 1,
                  borderColor: themeColors.dark.borderSecondary,
                }}
              >
                <Copy
                  size={moderateScale(14)}
                  color={themeColors.dark.onSurface}
                />
                <MyText
                  fontSize={moderateScale(12)}
                  weight="700"
                  color={themeColors.dark.onSurface}
                >
                  Copy
                </MyText>
              </Pressable>
              <Pressable
                onPress={() => void handleShareCode()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: scale(6),
                  paddingHorizontal: scale(14),
                  paddingVertical: verticalScale(10),
                  borderRadius: moderateScale(12),
                  backgroundColor: themeColors.dark.accent,
                }}
              >
                <Share2
                  size={moderateScale(14)}
                  color={themeColors.dark.onAccent}
                />
                <MyText
                  fontSize={moderateScale(12)}
                  weight="700"
                  color={themeColors.dark.onAccent}
                >
                  Share
                </MyText>
              </Pressable>
            </XStack>
          </YStack>

          <NearbySessionCard
            session={{ ...activeSession, listenerCount }}
            onJoin={() => undefined}
            showAction={false}
            listenerCountOverride={listenerCount}
          />

          <Pressable
            onPress={() => void handleEndRoom()}
            disabled={isEnding}
            style={{
              alignItems: "center",
              paddingVertical: verticalScale(14),
              borderRadius: moderateScale(14),
              backgroundColor: "#EF4444",
              opacity: isEnding ? 0.6 : 1,
            }}
          >
            <MyText
              fontSize={moderateScale(14)}
              weight="700"
              color={themeColors.dark.onAccent}
            >
              {isEnding ? "Ending room…" : "End Room"}
            </MyText>
          </Pressable>
        </YStack>
      ) : null}

      {isListeningPrivate && activeSession ? (
        <YStack gap={verticalScale(16)}>
          <NearbySessionCard
            session={activeSession}
            onJoin={() => undefined}
            onLeave={() => void handleLeave()}
            isLeaving={isLeaving}
            isActiveSession
            listenerCountOverride={listenerCount}
          />
        </YStack>
      ) : null}

      {!isHostingPrivate && !isListeningPrivate ? (
        <YStack gap={verticalScale(20)}>
          <YStack
            gap={verticalScale(12)}
            py={verticalScale(16)}
            px={scale(16)}
            rounded={moderateScale(18)}
            bg={themeColors.dark.surfaceSecondary}
            borderWidth={1}
            borderColor={themeColors.dark.borderSecondary}
          >
            <XStack items="center" gap={scale(8)}>
              <DoorOpen
                size={moderateScale(18)}
                color={themeColors.dark.accent}
              />
              <MyText
                fontSize={moderateScale(15)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                Create a room
              </MyText>
            </XStack>
            <MyText
              fontSize={moderateScale(13)}
              weight="500"
              color={themeColors.dark.textMuted}
            >
              {activeTrack
                ? `Share a code so friends can listen to “${activeTrack.title}” with you.`
                : "Play a song first, then create a room to share."}
            </MyText>
            <Pressable
              onPress={() => void handleCreateRoom()}
              disabled={!activeTrack || isCreating}
              style={{
                alignItems: "center",
                paddingVertical: verticalScale(14),
                borderRadius: moderateScale(14),
                backgroundColor: themeColors.dark.accent,
                opacity: !activeTrack || isCreating ? 0.5 : 1,
              }}
            >
              <MyText
                fontSize={moderateScale(14)}
                weight="700"
                color={themeColors.dark.onAccent}
              >
                {isCreating ? "Creating…" : "Create Room"}
              </MyText>
            </Pressable>
          </YStack>

          <YStack
            gap={verticalScale(12)}
            py={verticalScale(16)}
            px={scale(16)}
            rounded={moderateScale(18)}
            bg={themeColors.dark.surfaceSecondary}
            borderWidth={1}
            borderColor={themeColors.dark.borderSecondary}
          >
            <XStack items="center" gap={scale(8)}>
              <Hash
                size={moderateScale(18)}
                color={themeColors.dark.accent}
              />
              <MyText
                fontSize={moderateScale(15)}
                weight="700"
                color={themeColors.dark.onSurface}
              >
                Join with code
              </MyText>
            </XStack>
            <Input
              value={codeInput}
              onChangeText={(text) =>
                setCodeInput(text.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="0000"
              placeholderTextColor={themeColors.dark.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
              fontSize={moderateScale(28)}
              fontWeight="800"
              letterSpacing={moderateScale(10)}
              color={themeColors.dark.onSurface}
              bg={themeColors.dark.surface}
              borderWidth={1}
              borderColor={themeColors.dark.borderSecondary}
              rounded={moderateScale(14)}
              height={verticalScale(56)}
            />
            <Pressable
              onPress={() => void handleJoinByCode()}
              disabled={codeInput.length !== 4 || isJoining}
              style={{
                alignItems: "center",
                paddingVertical: verticalScale(14),
                borderRadius: moderateScale(14),
                backgroundColor: themeColors.dark.accent,
                opacity: codeInput.length !== 4 || isJoining ? 0.5 : 1,
              }}
            >
              <MyText
                fontSize={moderateScale(14)}
                weight="700"
                color={themeColors.dark.onAccent}
              >
                {isJoining ? "Joining…" : "Join Room"}
              </MyText>
            </Pressable>
          </YStack>
        </YStack>
      ) : null}
    </ScrollView>
  );
}
