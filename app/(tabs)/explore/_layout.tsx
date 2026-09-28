import { Stack } from "expo-router";

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="album/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="artist/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="playlist/[id]"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
