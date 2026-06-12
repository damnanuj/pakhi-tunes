import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { XStack, Input } from "tamagui";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { Search, X } from "@tamagui/lucide-icons";

interface SearchBarProps {
  mode?: "navigate" | "search";
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  mode = "search",
  value,
  onChangeText,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/explore");
  };

  const handleClear = () => {
    onChangeText?.("");
  };

  const showClearButton = mode === "search" && (value?.length ?? 0) > 0;

  const searchField = (
    <XStack
      width="100%"
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
        editable={mode === "search"}
        pointerEvents={mode === "search" ? "auto" : "none"}
        value={value ?? ""}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
      {showClearButton ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <X size={moderateScale(20)} color={themeColors.dark.textMuted} />
        </Pressable>
      ) : null}
    </XStack>
  );

  return (
    <XStack px={scale(20)} width="100%" items="stretch">
      {mode === "navigate" ? (
        <Pressable
          onPress={handleNavigate}
          style={({ pressed }) => ({
            width: "100%",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {searchField}
        </Pressable>
      ) : (
        searchField
      )}
    </XStack>
  );
}
