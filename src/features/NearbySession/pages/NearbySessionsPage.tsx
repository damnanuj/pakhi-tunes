import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import ConfirmDialog from "src/components/ConfirmDialog";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useRequireAuth } from "src/features/auth/hooks/useRequireAuth";
import RadarScanView from "../components/RadarScanView";
import NearbySessionCard from "../components/NearbySessionCard";
import { useNearbyDiscovery } from "../hooks/useNearbyDiscovery";
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
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const nearbySessions = useNearbySessionStore((s) => s.nearbySessions);
  const isScanning = useNearbySessionStore((s) => s.isScanning);
  const role = useNearbySessionStore((s) => s.role);
  const locationPermission = useNearbySessionStore((s) => s.locationPermission);

  const [permissionReady, setPermissionReady] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);

  const { joinSession } = useNearbySessionActions();
  const { scanOnce } = useNearbyDiscovery(
    permissionReady && isAuthenticated && role !== "listener"
  );

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

  const handleJoin = useCallback(
    async (session: NearbySession) => {
      setJoiningSessionId(session.id);
      try {
        const joined = await joinSession(session);
        if (joined) {
          router.push("/player");
        }
      } finally {
        setJoiningSessionId(null);
      }
    },
    [joinSession, router]
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

        <RadarScanView sessions={nearbySessions} isScanning={isScanning} />

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
          {nearbySessions.map((session) => (
            <NearbySessionCard
              key={session.id}
              session={session}
              onJoin={handleJoin}
              isJoining={joiningSessionId === session.id}
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
