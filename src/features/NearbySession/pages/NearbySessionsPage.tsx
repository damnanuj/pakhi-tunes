import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { YStack } from "tamagui";
import { useRouter } from "expo-router";
import ScreenHeader from "src/components/ScreenHeader";
import PillTabs, { type PillTabItem } from "src/components/PillTabs";
import themeColors from "src/utils/theme/colors";
import { verticalScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import NearbySessionsPanel from "../components/NearbySessionsPanel";
import PrivateRoomPanel from "../components/PrivateRoomPanel";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import {
  NEARBY_HOME_REDIRECT,
  redirectToSignInForNearby,
} from "../utils/nearbyAuthGate";

type SessionTabId = "nearby" | "room";

const SESSION_TABS: PillTabItem[] = [
  { id: "nearby", label: "Nearby" },
  { id: "room", label: "Room" },
];

function resolveInitialTab(
  roomCode: string | null,
  visibility: string | undefined
): SessionTabId {
  if (roomCode || visibility === "private") return "room";
  return "nearby";
}

export default function NearbySessionsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const roomCode = useNearbySessionStore((s) => s.roomCode);
  const activeSession = useNearbySessionStore((s) => s.activeSession);

  const [activeTab, setActiveTab] = useState<SessionTabId>(() =>
    resolveInitialTab(roomCode, activeSession?.visibility)
  );

  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(24),
  });

  useEffect(() => {
    if (!isHydrated || isAuthenticated) return;
    redirectToSignInForNearby(router, NEARBY_HOME_REDIRECT);
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (roomCode || activeSession?.visibility === "private") {
      setActiveTab("room");
    }
  }, [activeSession?.visibility, roomCode]);

  const tabs = useMemo(() => SESSION_TABS, []);

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Listen Together" showBack showSettings={false} />

      <View style={{ paddingVertical: verticalScale(12) }}>
        <PillTabs
          tabs={tabs}
          activeId={activeTab}
          onTabChange={(id) => setActiveTab(id as SessionTabId)}
        />
      </View>

      <YStack flex={1}>
        {activeTab === "nearby" ? (
          <NearbySessionsPanel bottomPadding={scrollBottomPadding} />
        ) : (
          <PrivateRoomPanel bottomPadding={scrollBottomPadding} />
        )}
      </YStack>
    </YStack>
  );
}
