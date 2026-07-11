import { Pressable } from "react-native";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import { verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

type AuthSwitchLinkProps = {
  prompt: string;
  linkText: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function AuthSwitchLink({
  prompt,
  linkText,
  onPress,
  disabled = false,
}: AuthSwitchLinkProps) {
  return (
    <XStack
      mt={verticalScale(20)}
      justify="center"
      items="center"
      gap={moderateScale(4)}
      flexWrap="wrap"
      opacity={disabled ? 0.5 : 1}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <MyText color={"$textSecondary"} fontSize={moderateScale(14)}>
        {prompt}
      </MyText>
      <Pressable onPress={disabled ? undefined : onPress} disabled={disabled}>
        <MyText
          color={disabled ? themeColors.dark.textMuted : themeColors.dark.accent}
          fontSize={moderateScale(14)}
          weight="600"
        >
          {linkText}
        </MyText>
      </Pressable>
    </XStack>
  );
}
