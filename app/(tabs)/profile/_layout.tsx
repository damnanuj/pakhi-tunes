import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="favourites"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
