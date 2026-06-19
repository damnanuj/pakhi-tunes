import { useState } from "react";
import { Button, Input, YStack, XStack, Stack, useTheme, Form } from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import MyText from "src/components/MyText";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { register } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import {
  getApiErrorMessage,
  hasFormErrors,
  sanitizeRedirectPath,
  validateSignUpForm,
} from "../utils/validation";
import AuthSwitchLink from "./AuthSwitchLink";
import DisabledGoogleAuthButton from "./DisabledGoogleAuthButton";
import AuthPasswordInput from "./AuthPasswordInput";

export default function SignUpForm({
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

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (name: keyof typeof form, value: string) => {
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (hasSubmitted) {
      setErrors(
        validateSignUpForm(updated.name, updated.email, updated.password)
      );
    }
    if (apiError) setApiError("");
  };

  const handleSignUp = async () => {
    const nextErrors = validateSignUpForm(form.name, form.email, form.password);
    setErrors(nextErrors);
    setHasSubmitted(true);
    if (hasFormErrors(nextErrors)) return;

    setIsLoading(true);
    setApiError("");
    try {
      const session = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSession(session);
      router.replace(sanitizeRedirectPath(redirect));
    } catch (error) {
      setApiError(
        getApiErrorMessage(error, "Unable to create account. Please try again.")
      );
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
            Full Name
          </MyText>
          <Input
            placeholderTextColor={"$textSecondary"}
            focusStyle={{ borderColor: theme.accentYellow }}
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            bg={"transparent"}
            placeholder="Enter Your Name"
            width="100%"
            height={moderateScale(50)}
            rounded={moderateScale(8)}
            borderWidth={moderateScale(1.5, 0.3)}
            borderColor={errors.name ? "red" : "$borderPrimary"}
            style={{
              fontFamily: "MPlusRounded500",
              fontSize: moderateScale(14),
              color: theme.textPrimary.val,
            }}
          />
          {errors.name ? <MyText color={"red"}>{errors.name}</MyText> : null}
        </YStack>

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
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
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
          {errors.email ? <MyText color={"red"}>{errors.email}</MyText> : null}
        </YStack>

        <YStack width="100%" gap={verticalScale(10)} borderColor={"white"}>
          <MyText color={"$textPrimary"} fontSize={moderateScale(16)}>
            Password
          </MyText>
          <AuthPasswordInput
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            placeholder="Create a Password"
            hasError={Boolean(errors.password)}
          />
          {errors.password ? (
            <MyText color={"red"}>{errors.password}</MyText>
          ) : null}
        </YStack>

        <Form.Trigger asChild>
          <Button
            width="100%"
            bg={themeColors.dark.accent}
            size="$4"
            onPress={handleSignUp}
            disabled={isLoading}
            opacity={isLoading ? 0.7 : 1}
            mt={verticalScale(16)}
          >
            <MyText color={"$accentBlack"}>
              {isLoading ? "Creating account..." : "Create Account"}
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

        <DisabledGoogleAuthButton label="Sign up with Google" />

        <AuthSwitchLink
          prompt="Already have an account?"
          linkText="Sign in here"
          onPress={onSwitchMode}
        />
      </Form>
    </>
  );
}
