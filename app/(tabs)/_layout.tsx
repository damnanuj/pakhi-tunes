import { Tabs } from "expo-router";
import BottomTabBar from "src/components/customTabBars/BottomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Search" }} />
      <Tabs.Screen name="profile" options={{ title: "Library" }} />
      <Tabs.Screen name="settings" options={{ title: "Profile" }} />
    </Tabs>
  );
}
