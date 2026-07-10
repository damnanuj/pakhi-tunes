import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { useRouter } from "expo-router";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset, useRefreshable } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import RadarScanView from "../components/RadarScanView";
import NearbyListeningControl from "../components/NearbyListeningControl";
import NearbySessionCard from "../components/NearbySessionCard";
import { isSessionFresh, useNearbyDiscovery } from "../hooks/useNearbyDiscovery";
import { useNearbySessionActions } from "../providers/NearbySessionProvider";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { NearbySession } from "../types/session.types";
import {
  DIALOG_ALLOW,
  DIALOG_CANCEL,
  DIALOG_SETTINGS,
  LOCATION_PERMISSION_MESSAGE,
  LOCATION_PERMISSION_SUBTITLE,
  LOCATION_PERMISSION_TITLE,
  LOCATION_SETTINGS_MESSAGE,
  openAppSettings,
  requestLocationPermission,
} from "../utils/locationPermission";
import {
  NEARBY_HOME_REDIRECT,
  redirectToSignInForNearby,
} from "../utils/nearbyAuthGate";

export default function NearbySessionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const discoverable = Boolean(user?.discoverable);
  const nearbySessions = useNearbySessionStore((s) => s.nearbySessions);
  const isScanning = useNearbySessionStore((s) => s.isScanning);
  const role = useNearbySessionStore((s) => s.role);
  const activeSession = useNearbySessionStore((s) => s.activeSession);
  const liveListenerCount = useNearbySessionStore((s) => s.listenerCount);
  const locationPermission = useNearbySessionStore((s) => s.locationPermission);

  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const permissionReady = locationPermission === "granted";
  const discoveryEnabled =
    permissionReady &&
    isAuthenticated &&
    discoverable &&
    role !== "listener";

  const { joinSession, leaveSession } = useNearbySessionActions();
  const { scanOnce } = useNearbyDiscovery(discoveryEnabled);

  const { refreshControl } = useRefreshable({
    onRefresh: async () => {
      if (!discoveryEnabled) return;
      await scanOnce();
    },
  });

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(24),
  });

  useEffect(() => {
    if (!isHydrated || isAuthenticated) return;
    redirectToSignInForNearby(router, NEARBY_HOME_REDIRECT);
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (!isAuthenticated || !discoverable) return;
    void (async () => {
      const granted = await requestLocationPermission();
      if (!granted) {
        setShowPermissionInfo(true);
      }
    })();
  }, [discoverable, isAuthenticated]);

  useEffect(() => {
    if (discoverable || role === "listener") return;
    useNearbySessionStore.getState().setNearbySessions([]);
    useNearbySessionStore.getState().setIsScanning(false);
  }, [discoverable, role]);

  const handleLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      await leaveSession();
      if (discoveryEnabled) {
        void scanOnce();
      }
    } finally {
      setIsLeaving(false);
    }
  }, [discoveryEnabled, leaveSession, scanOnce]);

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
      if (!discoverable) return;
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
    [discoverable, joinSession, scanOnce]
  );

  const handlePermissionConfirm = useCallback(async () => {
    setShowPermissionInfo(false);
    const granted = await requestLocationPermission();
    if (!granted) {
      setShowSettingsPrompt(true);
      return;
    }
    if (discoverable) {
      void scanOnce();
    }
  }, [discoverable, scanOnce]);

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

        <NearbyListeningControl />

        <RadarScanView
          sessions={orderedSessions}
          isScanning={isScanning}
          discoverable={discoverable}
        />

        {locationPermission === "denied" && discoverable ? (
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
        title={LOCATION_PERMISSION_TITLE}
        subtitle={LOCATION_PERMISSION_SUBTITLE}
        message={LOCATION_PERMISSION_MESSAGE}
        confirmLabel={DIALOG_ALLOW}
        cancelLabel={DIALOG_CANCEL}
        onConfirm={() => void handlePermissionConfirm()}
      />

      <ConfirmDialog
        open={showSettingsPrompt}
        onOpenChange={setShowSettingsPrompt}
        title={LOCATION_PERMISSION_TITLE}
        subtitle={LOCATION_PERMISSION_SUBTITLE}
        message={LOCATION_SETTINGS_MESSAGE}
        confirmLabel={DIALOG_SETTINGS}
        cancelLabel={DIALOG_CANCEL}
        onConfirm={() => void openAppSettings()}
      />
    </YStack>
  );
}
