import { memo } from "react";
import { YStack } from "tamagui";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";

interface SearchSectionTitleRowProps {
  label: string;
}

function SearchSectionTitleRow({ label }: SearchSectionTitleRowProps) {
  return (
    <YStack px={scale(20)} pt={verticalScale(14)} pb={verticalScale(4)}>
      <MyText
        fontSize={moderateScale(16)}
        weight="700"
        color={themeColors.dark.onSurface}
      >
        {label}
      </MyText>
    </YStack>
  );
}

export default memo(SearchSectionTitleRow);
