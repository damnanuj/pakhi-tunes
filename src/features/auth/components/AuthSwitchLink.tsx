import { Pressable } from "react-native";
import { XStack } from "tamagui";
import MyText from "src/components/MyText";
import { verticalScale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

type AuthSwitchLinkProps = {
  prompt: string;
  linkText: string;
  onPress: () => void;
};

export default function AuthSwitchLink({
  prompt,
  linkText,
  onPress,
}: AuthSwitchLinkProps) {
  return (
    <XStack
      mt={verticalScale(20)}
      justify="center"
      items="center"
      gap={moderateScale(4)}
      flexWrap="wrap"
    >
      <MyText color={"$textSecondary"} fontSize={moderateScale(14)}>
        {prompt}
      </MyText>
      <Pressable onPress={onPress}>
        <MyText
          color={themeColors.dark.accent}
          fontSize={moderateScale(14)}
          weight="600"
        >
          {linkText}
        </MyText>
      </Pressable>
    </XStack>
  );
}
