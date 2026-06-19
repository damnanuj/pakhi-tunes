import { useState } from "react";
import { Pressable } from "react-native";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Input, XStack, useTheme } from "tamagui";
import { moderateScale, scale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

type AuthPasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  hasError?: boolean;
  htmlFor?: string;
};

export default function AuthPasswordInput({
  value,
  onChangeText,
  placeholder,
  hasError = false,
  htmlFor,
}: AuthPasswordInputProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <XStack width="100%" position="relative" items="center">
      <Input
        placeholderTextColor={"$textSecondary"}
        focusStyle={{ borderColor: theme.accentYellow }}
        value={value}
        onChangeText={onChangeText}
        htmlFor={htmlFor}
        bg={"transparent"}
        placeholder={placeholder}
        secureTextEntry={!isVisible}
        width="100%"
        height={moderateScale(50)}
        rounded={moderateScale(8)}
        borderWidth={moderateScale(1.5, 0.3)}
        borderColor={hasError ? "red" : "$borderPrimary"}
        pr={scale(44)}
        style={{
          fontFamily: "MPlusRounded500",
          fontSize: moderateScale(14),
          color: theme.textPrimary.val,
        }}
      />
      <Pressable
        onPress={() => setIsVisible((current) => !current)}
        hitSlop={8}
        style={{
          position: "absolute",
          right: scale(14),
          height: moderateScale(50),
          justifyContent: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? (
          <EyeOff
            size={moderateScale(20)}
            color={themeColors.dark.textMuted}
          />
        ) : (
          <Eye size={moderateScale(20)} color={themeColors.dark.textMuted} />
        )}
      </Pressable>
    </XStack>
  );
}
