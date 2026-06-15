import { ScrollView } from "react-native";
import { YStack } from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { scale, verticalScale } from "src/utils/functions/dimensions";
import ScreenHeader from "src/components/ScreenHeader";
import AuthBranding from "../components/AuthBranding";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import { useAuthBack } from "../hooks/useAuthBack";
import type { AuthMode } from "../types/auth.types";

function normalizeMode(mode?: string | string[]): AuthMode {
  const value = Array.isArray(mode) ? mode[0] : mode;
  return value === "signup" ? "signup" : "signin";
}

const AuthPage = () => {
  const router = useRouter();
  const { mode: modeParam, redirect } = useLocalSearchParams<{
    mode?: string;
    redirect?: string;
  }>();
  const mode = normalizeMode(modeParam);
  const handleAuthBack = useAuthBack();

  const switchMode = (next: AuthMode) => {
    router.setParams(redirect ? { mode: next, redirect } : { mode: next });
  };

  return (
    <>
      <ScreenHeader showBack showSettings={false} onBackPress={handleAuthBack} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <YStack
          px={scale(25)}
          py={verticalScale(20)}
          bg={"$background"}
          height={"100%"}
          flex={1}
          items={"center"}
          borderColor={"blue"}
        >
          <AuthBranding />
          {mode === "signup" ? (
            <SignUpForm onSwitchMode={() => switchMode("signin")} />
          ) : (
            <SignInForm onSwitchMode={() => switchMode("signup")} />
          )}
        </YStack>
      </ScrollView>
    </>
  );
};

export default AuthPage;
