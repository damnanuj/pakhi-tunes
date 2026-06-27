import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset, useRefreshable } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useRequireAuth } from "src/features/auth/hooks/useRequireAuth";
import RadarScanView from "../components/RadarScanView";
import NearbySessionCard from "../components/NearbySessionCard";
import { isSessionFresh, useNearbyDiscovery } from "../hooks/useNearbyDiscovery";
import { useNearbySessionActions } from "../providers/NearbySessionProvider";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { NearbySession } from "../types/session.types";
import {
  LOCATION_PERMISSION_MESSAGE,
  openAppSettings,
  requestLocationPermission,
} from "../utils/locationPermission";

export default function NearbySessionsPage() {
  useRequireAuth();
  const { isAuthenticated } = useAuth();
  const nearbySessions = useNearbySessionStore((s) => s.nearbySessions);
  const isScanning = useNearbySessionStore((s) => s.isScanning);
  const role = useNearbySessionStore((s) => s.role);
  const activeSession = useNearbySessionStore((s) => s.activeSession);
  const liveListenerCount = useNearbySessionStore((s) => s.listenerCount);
  const locationPermission = useNearbySessionStore((s) => s.locationPermission);

  const [permissionReady, setPermissionReady] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const { joinSession, leaveSession } = useNearbySessionActions();
  const { scanOnce } = useNearbyDiscovery(
    permissionReady && isAuthenticated && role !== "listener"
  );

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      if (!permissionReady) return;
      await scanOnce();
    },
  });

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(24),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    void (async () => {
      const granted = await requestLocationPermission();
      if (!granted) {
        setShowPermissionInfo(true);
        return;
      }
      setPermissionReady(true);
    })();
  }, [isAuthenticated]);

  const handleLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      await leaveSession();
      void scanOnce();
    } finally {
      setIsLeaving(false);
    }
  }, [leaveSession, scanOnce]);

  const orderedSessions = useMemo(() => {
    const freshSessions = nearbySessions.filter(
      (s) =>
        s.id === joiningSessionId ||
        s.id === activeSession?.id ||
        isSessionFresh(s)
    );
    if (role !== "listener" || !activeSession) return freshSessions;
    const active = freshSessions.find((s) => s.id === activeSession.id);
    const mergedActive = active
      ? { ...active, ...activeSession }
      : activeSession;
    const rest = freshSessions.filter((s) => s.id !== activeSession.id);
    return [mergedActive, ...rest];
  }, [activeSession, joiningSessionId, nearbySessions, role]);

  const handleJoin = useCallback(
    async (session: NearbySession) => {
      setJoiningSessionId(session.id);
      try {
        const joined = await joinSession(session);
        if (!joined) {
          const current = useNearbySessionStore.getState().nearbySessions;
          useNearbySessionStore
            .getState()
            .setNearbySessions(current.filter((s) => s.id !== session.id));
          void scanOnce();
        }
      } finally {
        setJoiningSessionId(null);
      }
    },
    [joinSession, scanOnce]
  );

  const handlePermissionConfirm = useCallback(async () => {
    setShowPermissionInfo(false);
    const granted = await requestLocationPermission();
    if (!granted) {
      setShowSettingsPrompt(true);
      return;
    }
    setPermissionReady(true);
    void scanOnce();
  }, [scanOnce]);

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Nearby Listening" showBack showSettings={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: scrollBottomPadding,
          gap: verticalScale(20),
        }}
      >
        <MyText
          fontSize={scale(14)}
          weight="500"
          color={themeColors.dark.textMuted}
          textAlign="center"
        >
          Discover people playing music around you and join their session in sync.
        </MyText>

        <RadarScanView sessions={orderedSessions} isScanning={isScanning} />

        {locationPermission === "denied" ? (
          <MyText
            fontSize={scale(13)}
            weight="600"
            color={themeColors.dark.accent}
            textAlign="center"
            onPress={() => void openAppSettings()}
          >
            Location access is off. Tap to open Settings.
          </MyText>
        ) : null}

        <YStack gap={verticalScale(12)}>
          {orderedSessions.map((session) => (
            <NearbySessionCard
              key={session.id}
              session={session}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isJoining={joiningSessionId === session.id}
              isLeaving={
                isLeaving &&
                role === "listener" &&
                activeSession?.id === session.id
              }
              isActiveSession={
                role === "listener" && activeSession?.id === session.id
              }
              listenerCountOverride={
                role === "listener" && activeSession?.id === session.id
                  ? liveListenerCount
                  : undefined
              }
            />
          ))}
        </YStack>
      </ScrollView>

      <ConfirmDialog
        open={showPermissionInfo}
        onOpenChange={setShowPermissionInfo}
        title="Find music nearby"
        message={LOCATION_PERMISSION_MESSAGE}
        confirmLabel="Allow location"
        cancelLabel="Not now"
        onConfirm={() => void handlePermissionConfirm()}
      />

      <ConfirmDialog
        open={showSettingsPrompt}
        onOpenChange={setShowSettingsPrompt}
        title="Location permission needed"
        message="Enable location in Settings to scan for nearby listening sessions."
        confirmLabel="Open Settings"
        cancelLabel="Cancel"
        onConfirm={() => void openAppSettings()}
      />
    </YStack>
  );
}
