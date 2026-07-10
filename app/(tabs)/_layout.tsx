import { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import BottomTabBar from "src/components/BottomTabBar";
import { MiniPlayer } from "src/features/Player";

export default function TabLayout() {
  useEffect(() => {
    void import("src/features/auth/pages/AuthPage");
  }, []);

  return (
    <Tabs
      tabBar={(props) => (
        <View style={{ position: "relative", width: "100%" }}>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Search" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
