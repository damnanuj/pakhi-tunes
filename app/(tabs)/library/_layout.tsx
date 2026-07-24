import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="playlist/[id]"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
