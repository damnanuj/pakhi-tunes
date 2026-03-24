import "../tamagui-web.css";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  useFonts,
  MPLUSRounded1c_100Thin,
  MPLUSRounded1c_300Light,
  MPLUSRounded1c_400Regular as MPlusRounded400,
  MPLUSRounded1c_500Medium as MPlusRounded500,
  MPLUSRounded1c_700Bold as MPlusRounded700,
  MPLUSRounded1c_800ExtraBold as MPlusRounded800,
  MPLUSRounded1c_900Black as MPlusRounded900,
} from "@expo-google-fonts/m-plus-rounded-1c";
import { SplashScreen, Stack } from "expo-router";
import Provider from "./Provider";

import {
  ThemeProviderCustom,
  useThemeController,
} from "src/contexts/ThemeContext/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniPlayerRootLayer, PlayerProvider } from "src/features/Player";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const [interLoaded, interError] = useFonts({
  //   Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
  //   InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  //   NeonRegular: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  // useEffect(() => {
  //   if (interLoaded || interError) {
  //     // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
  //     SplashScreen.hideAsync();
  //   }
  // }, [interLoaded, interError]);

  // if (!interLoaded && !interError) {
  //   return null;
  // }

  const [fontsLoaded] = useFonts({
    Sparkle: require("../assets/fonts/Sparkle.ttf"),

    NeoNeon: require("../assets/fonts/NeoNeon.otf"),

    MPLUSRounded1c_100Thin,
    MPLUSRounded1c_300Light,
    MPlusRounded400,
    MPlusRounded500,
    MPlusRounded700,
    MPlusRounded800,
    MPlusRounded900,
  });

  useEffect(() => {
    // console.log("Fonts loaded?", fontsLoaded);
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}
const queryClient = new QueryClient();
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProviderCustom>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <Provider>
            {children}
            <MiniPlayerRootLayer />
          </Provider>
        </PlayerProvider>
      </QueryClientProvider>
    </ThemeProviderCustom>
  );
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { theme } = useThemeController();

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="entry" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen
          name="top-artists"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="player"
          options={{ animation: "slide_from_bottom", headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
