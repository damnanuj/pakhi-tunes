import { useState } from "react";
import {
  Button,
  Input,
  YStack,
  XStack,
  Stack,
  Checkbox,
  CheckboxProps,
  Image,
  useTheme,
  Form,
} from "tamagui";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import MyText from "src/components/MyText";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { Check as CheckIcon } from "@tamagui/lucide-icons";
import { Label } from "tamagui";

const LoginPage = () => {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <YStack
        px={scale(25)}
        py={verticalScale(60)}
        bg={"$background"}
        height={"100%"}
        flex={1}
        items={"center"}
        borderColor={"blue"}
      >
        <YStack
          justify={"center"}
          items={"center"}
          gap={verticalScale(10)}
        >
          <MyText
            borderColor={"red"}
            fontSize={moderateScale(100)}
            color={"$accentYellow"}
            style={{ fontFamily: "Sparkle" }}
          >
            P
          </MyText>

          <MyText
            borderColor={"green"}
            style={{ fontFamily: "NeoNeon" }}
            color={themeColors.dark.accent}
            fontSize={moderateScale(60)}
          >
            Pakhi Tunes
          </MyText>
          <MyText color={"$textSecondary"}>
            Your music, your way
          </MyText>
        </YStack>

        <SigninForm />
      </YStack>
    </ScrollView>
  );
};

export default LoginPage;

function SigninForm() {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      validateForm(updatedForm);
    }
  };

  const validateForm = (formData = signInForm) => {
    const newErrors: { email: string; password: string } = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = () => {
    const isValid = validateForm();
    setHasSubmitted(true);
    if (!isValid) return;
    setIsLoading(true);
    router.replace("/(tabs)/home");
    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    router.replace("/(tabs)/home");
    setIsLoading(false);
  };

  return (
    <>
      <Form
        mt={verticalScale(60)}
        width="100%"
        items="center"
        borderColor={"red"}
      >
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
          <Input
            placeholderTextColor={"$textSecondary"}
            focusStyle={{ borderColor: theme.accentYellow }}
            value={signInForm.password}
            onChangeText={(text) => handleChange("password", text)}
            htmlFor="password"
            bg={"transparent"}
            placeholder="Enter Your Password"
            secureTextEntry
            width="100%"
            height={moderateScale(50)}
            rounded={moderateScale(8)}
            borderWidth={moderateScale(1.5, 0.3)}
            borderColor={errors.password ? "red" : "$borderPrimary"}
            style={{
              fontFamily: "MPlusRounded500",
              fontSize: moderateScale(14),
              color: theme.textPrimary.val,
            }}
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
            <MyText color={"$textPrimary"}>
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
        <Button
          width="100%"
          borderWidth={moderateScale(1.5, 0.3)}
          borderColor={themeColors.dark.textMuted}
          size="$4"
          bg="transparent"
          icon={<GoogleIcon size={30} />}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          opacity={isLoading ? 0.7 : 1}
        >
          <MyText color={"$textPrimary"}>
            {isLoading ? "Signing in with Google" : "Sign in with Google"}
          </MyText>
        </Button>
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
