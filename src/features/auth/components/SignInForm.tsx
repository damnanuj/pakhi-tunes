import { useState } from "react";
import {
  Button,
  Input,
  YStack,
  XStack,
  Stack,
  Checkbox,
  CheckboxProps,
  useTheme,
  Form,
} from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { Label } from "tamagui";
import MyText from "src/components/MyText";
import { appToast } from "src/components/toast/appToastHelpers";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { login } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import {
  getApiErrorMessage,
  hasFormErrors,
  sanitizeRedirectPath,
  validateSignInForm,
} from "../utils/validation";
import AuthSwitchLink from "./AuthSwitchLink";
import DisabledGoogleAuthButton from "./DisabledGoogleAuthButton";
import AuthPasswordInput from "./AuthPasswordInput";

export default function SignInForm({
  onSwitchMode,
}: {
  onSwitchMode: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (name: string, value: string) => {
    const updatedForm = {
      ...signInForm,
      [name]: value,
    };
    setSignInForm(updatedForm);
    if (hasSubmitted) {
      setErrors(validateSignInForm(updatedForm.email, updatedForm.password));
    }
    if (apiError) setApiError("");
  };

  const handleSignIn = async () => {
    const nextErrors = validateSignInForm(signInForm.email, signInForm.password);
    setErrors(nextErrors);
    setHasSubmitted(true);
    if (hasFormErrors(nextErrors)) return;

    setIsLoading(true);
    setApiError("");
    try {
      const session = await login({
        email: signInForm.email.trim(),
        password: signInForm.password,
      });
      setSession(session);
      appToast.welcomeBack(session.user.name);
      router.replace(sanitizeRedirectPath(redirect));
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form
        mt={verticalScale(40)}
        width="100%"
        items="center"
        borderColor={"red"}
      >
        {apiError ? (
          <MyText color="red" mb={verticalScale(12)} width="100%">
            {apiError}
          </MyText>
        ) : null}

        <YStack
          width="100%"
          gap={verticalScale(10)}
          borderColor={"white"}
          mb={verticalScale(20)}
        >
          <MyText color={"$textPrimary"} fontSize={moderateScale(16)}>
            Email Address
          </MyText>

          <Input
            placeholderTextColor={"$textSecondary"}
            focusStyle={{ borderColor: theme.accentYellow }}
            value={signInForm.email}
            onChangeText={(text) => handleChange("email", text)}
            htmlFor="email"
            autoCapitalize="none"
            keyboardType="email-address"
            bg={"transparent"}
            placeholder="Enter Your Email"
            width="100%"
            height={moderateScale(50)}
            rounded={moderateScale(8)}
            borderWidth={moderateScale(1.5, 0.3)}
            borderColor={errors.email ? "red" : "$borderPrimary"}
            style={{
              fontFamily: "MPlusRounded500",
              fontSize: moderateScale(14),
              color: theme.textPrimary.val,
            }}
          />
          {errors.email && <MyText color={"red"}>{errors.email}</MyText>}
        </YStack>

        <YStack
          width="100%"
          gap={verticalScale(10)}
          borderColor={"white"}
        >
          <MyText color={"$textPrimary"} fontSize={moderateScale(16)}>
            Password
          </MyText>
          <AuthPasswordInput
            value={signInForm.password}
            onChangeText={(text) => handleChange("password", text)}
            htmlFor="password"
            placeholder="Enter Your Password"
            hasError={Boolean(errors.password)}
          />
          {errors.password && <MyText color={"red"}>{errors.password}</MyText>}
        </YStack>
        <XStack width="100%" items={"center"} justify={"space-between"}>
          <CheckboxWithLabel size="$3" />
          <MyText color="#3BB154" fontSize="$2" fontWeight="500">
            Forgot password?
          </MyText>
        </XStack>
        <Form.Trigger asChild>
          <Button
            width="100%"
            bg={themeColors.dark.accent}
            size="$4"
            onPress={handleSignIn}
            disabled={isLoading}
            opacity={isLoading ? 0.7 : 1}
          >
            <MyText color={"$accentBlack"}>
              {isLoading ? "Signing in..." : "Sign In"}
            </MyText>
          </Button>
        </Form.Trigger>
        <XStack
          my={verticalScale(15)}
          borderColor={"red"}
          justify={"center"}
          items={"center"}
          gap={scale(15)}
        >
          <Stack
            borderWidth={0.5}
            borderStyle="dotted"
            flex={1}
            borderColor={"#fff"}
          />
          <MyText color={"#fff"}>OR</MyText>
          <Stack
            borderWidth={0.5}
            flex={1}
            borderStyle="dotted"
            borderColor={"#fff"}
          />
        </XStack>
        <DisabledGoogleAuthButton label="Sign in with Google" />

        <AuthSwitchLink
          prompt="Don't have an account?"
          linkText="Sign up here"
          onPress={onSwitchMode}
        />
      </Form>
    </>
  );
}

function CheckboxWithLabel({
  size,
  label = "Remember Me",
  ...checkboxProps
}: CheckboxProps & { label?: string }) {
  const id = `checkbox-${(size || "").toString().slice(1)}`;
  return (
    <XStack
      my={verticalScale(5)}
      borderColor={"red"}
      items="center"
      gap={scale(5)}
    >
      <Checkbox id={id} size={size} {...checkboxProps}>
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>

      <Label htmlFor={id}>
        <MyText color={"$textPrimary"} htmlFor={id}>
          {label}
        </MyText>
      </Label>
    </XStack>
  );
}
