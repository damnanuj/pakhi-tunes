import { View } from "react-native";
import { YStack } from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
    <YStack flex={1} bg="$background">
      <ScreenHeader showBack showSettings={false} onBackPress={handleAuthBack} />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={verticalScale(40)}
        extraKeyboardSpace={verticalScale(32)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: verticalScale(48),
        }}
      >
        <YStack
          px={scale(25)}
          // py={verticalScale(20)}/
          items="center"
        >
          <AuthBranding />
          {mode === "signup" ? (
            <SignUpForm onSwitchMode={() => switchMode("signin")} />
          ) : (
            <SignInForm onSwitchMode={() => switchMode("signup")} />
          )}
          <View style={{ height: verticalScale(32) }} />
        </YStack>
      </KeyboardAwareScrollView>
    </YStack>
  );
};

export default AuthPage;
