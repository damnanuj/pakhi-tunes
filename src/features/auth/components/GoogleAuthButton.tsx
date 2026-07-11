import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Image, Stack, XStack } from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import MyText from "src/components/MyText";
import { appToast } from "src/components/toast/appToastHelpers";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { useAuth } from "../hooks/useAuth";
import { signInWithGoogle } from "../services/googleAuth.service";
import { getApiErrorMessage, sanitizeRedirectPath } from "../utils/validation";

const GOOGLE_LOADING = {
  text: "#5F6368",
  spinner: "#5F6368",
} as const;

interface GoogleAuthButtonProps {
  label: string;
  onError?: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function GoogleIcon({ size }: { size: number }) {
  return (
    <Image
      src={"https://img.icons8.com/fluency/48/google-logo.png"}
      alt="google-logo"
      height={moderateScale(size)}
      width={moderateScale(size)}
    />
  );
}

export default function GoogleAuthButton({
  label,
  onError,
  onLoadingChange,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  };

  const handlePress = async () => {
    if (isLoading) return;

    setLoading(true);
    onError?.("");

    try {
      const { session, isNewUser } = await signInWithGoogle();
      setSession(session);
      if (isNewUser) {
        appToast.welcome(session.user.name);
      } else {
        appToast.welcomeBack(session.user.name);
      }
      router.replace(sanitizeRedirectPath(redirect));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        error instanceof Error
          ? error.message
          : "Unable to continue with Google. Please try again."
      );
      onError?.(message);
      setLoading(false);
    }
  };

  return (
    <Stack width="100%" position="relative">
      <Button
        width="100%"
        borderWidth={moderateScale(1.5, 0.3)}
        borderColor={themeColors.dark.textMuted}
        size="$4"
        bg="transparent"
        disabled={isLoading}
        onPress={() => void handlePress()}
        pressStyle={{ opacity: 0.85 }}
      >
        {isLoading ? (
          <XStack width="100%" items="center" justify="center" gap={scale(10)}>
            <GoogleIcon size={24} />
            <MyText color={GOOGLE_LOADING.text} fontSize={moderateScale(14)}>
              Signing in with Google...
            </MyText>
            <ActivityIndicator size="small" color={GOOGLE_LOADING.spinner} />
          </XStack>
        ) : (
          <XStack width="100%" items="center" justify="center" gap={scale(10)}>
            <GoogleIcon size={24} />
            <MyText color={"$textSecondary"} fontSize={moderateScale(14)}>
              {label}
            </MyText>
          </XStack>
        )}
      </Button>
    </Stack>
  );
}
