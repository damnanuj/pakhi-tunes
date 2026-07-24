import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="album/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="new-albums"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="new-songs"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="new-releases"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="top-artists"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="genres/[slug]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="nearby"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="listen-together"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
