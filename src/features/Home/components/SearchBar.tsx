import { XStack, Input } from "tamagui";
import {
  scale,
  moderateScale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { Search, Mic } from "@tamagui/lucide-icons";

export default function SearchBar() {
  return (
    <XStack px={scale(20)}>
      <XStack
        flex={1}
        flexDirection="row"
        items="center"
        bg={themeColors.dark.surfaceSecondary}
        rounded={moderateScale(12)}
        px={scale(16)}
        height={moderateScale(48)}
        gap={scale(12)}
        borderWidth={1}
        borderColor={themeColors.dark.borderSecondary}
      >
        <Search size={moderateScale(20)} color={themeColors.dark.textMuted} />
        <Input
          flex={1}
          placeholder="Search Music"
          placeholderTextColor={themeColors.dark.textMuted}
          bg={themeColors.dark.surfaceSecondary}
          borderWidth={0}
          fontSize={moderateScale(16)}
          color={themeColors.dark.onSurface}
          style={{ fontFamily: "MPlusRounded500" }}
        />
        <Mic size={moderateScale(20)} color={themeColors.dark.textMuted} />
      </XStack>
    </XStack>
  );
}
