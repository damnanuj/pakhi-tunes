import { ActivityIndicator, View } from "react-native";
import { verticalScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

export default function ListFooterSpinner() {
  return (
    <View
      style={{
        paddingVertical: verticalScale(16),
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="small" color={themeColors.dark.accent} />
    </View>
  );
}
