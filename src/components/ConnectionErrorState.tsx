import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { AlertCircle, WifiOff } from "@tamagui/lucide-icons";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import { navigateToLibraryTab } from "src/features/Library/utils/navigateToLibraryTab";

type ConnectionErrorVariant = "offline" | "error";

const COPY: Record<
  ConnectionErrorVariant,
  { title: string; subtitle: string }
> = {
  offline: {
    title: "No connection",
    subtitle:
      "You seem to be offline. Please check your internet and try again.",
  },
  error: {
    title: "Something went wrong",
    subtitle: "We couldn't load this content. Please try again.",
  },
};

function OfflineIllustration({ compact }: { compact?: boolean }) {
  const size = moderateScale(compact ? 80 : 120);
  const accent = themeColors.dark.accent;
  const muted = themeColors.dark.textMuted;

  return (
    <View style={{ width: size, height: size, alignItems: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r="52"
          fill={themeColors.dark.surfaceSecondary}
        />
        <Path
          d="M38 72c8-10 18-15 22-15s14 5 22 15"
          stroke={accent}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M48 82c4-5 8-7 12-7s8 2 12 7"
          stroke={accent}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx="60" cy="92" r="5" fill={accent} />
        <Line
          x1="34"
          y1="34"
          x2="86"
          y2="86"
          stroke={muted}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          top: moderateScale(compact ? 4 : 8),
          right: 0,
        }}
      >
        <WifiOff size={moderateScale(compact ? 20 : 28)} color="#f87171" />
      </View>
    </View>
  );
}

function ErrorIllustration({ compact }: { compact?: boolean }) {
  const size = moderateScale(compact ? 80 : 120);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: themeColors.dark.surfaceSecondary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AlertCircle
        size={moderateScale(compact ? 36 : 48)}
        color={themeColors.dark.textMuted}
      />
    </View>
  );
}

export interface ConnectionErrorStateProps {
  variant?: ConnectionErrorVariant;
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  showDownloadsCta?: boolean;
  compact?: boolean;
}

export default function ConnectionErrorState({
  variant = "offline",
  title,
  subtitle,
  onRetry,
  isRetrying = false,
  showDownloadsCta = true,
  compact = false,
}: ConnectionErrorStateProps) {
  const router = useRouter();
  const copy = COPY[variant];
  const resolvedTitle = title ?? copy.title;
  const resolvedSubtitle = subtitle ?? copy.subtitle;

  return (
    <YStack
      flex={compact ? undefined : 1}
      items="center"
      justify="center"
      px={scale(compact ? 20 : 32)}
      py={verticalScale(compact ? 16 : 24)}
      gap={verticalScale(compact ? 10 : 16)}
    >
      {variant === "offline" ? (
        <OfflineIllustration compact={compact} />
      ) : (
        <ErrorIllustration compact={compact} />
      )}
      <MyText
        fontSize={moderateScale(compact ? 16 : 20)}
        weight="700"
        color={themeColors.dark.onSurface}
        textAlign="center"
      >
        {resolvedTitle}
      </MyText>
      <MyText
        fontSize={moderateScale(compact ? 13 : 14)}
        weight="400"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        {resolvedSubtitle}
      </MyText>
      <YStack gap={verticalScale(10)} mt={verticalScale(compact ? 4 : 8)}>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            disabled={isRetrying}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={({ pressed }) => ({
              paddingHorizontal: scale(24),
              paddingVertical: verticalScale(compact ? 10 : 12),
              borderRadius: moderateScale(24),
              backgroundColor: themeColors.dark.accent,
              opacity: pressed || isRetrying ? 0.85 : 1,
              minWidth: scale(compact ? 140 : 160),
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            {isRetrying ? (
              <ActivityIndicator
                size="small"
                color={themeColors.dark.onAccent}
              />
            ) : (
              <MyText
                fontSize={moderateScale(14)}
                weight="700"
                color={themeColors.dark.onAccent}
              >
                Retry
              </MyText>
            )}
          </Pressable>
        ) : null}
        {showDownloadsCta ? (
          <Pressable
            onPress={() => navigateToLibraryTab(router, "downloads")}
            accessibilityRole="button"
            accessibilityLabel="Go to Downloads"
            style={({ pressed }) => ({
              paddingHorizontal: scale(24),
              paddingVertical: verticalScale(compact ? 10 : 12),
              borderRadius: moderateScale(24),
              borderWidth: 1,
              borderColor: themeColors.dark.borderSecondary,
              opacity: pressed ? 0.85 : 1,
              minWidth: scale(compact ? 140 : 160),
              alignItems: "center",
            })}
          >
            <MyText
              fontSize={moderateScale(14)}
              weight="600"
              color={themeColors.dark.textMuted}
            >
              Go to Downloads
            </MyText>
          </Pressable>
        ) : null}
      </YStack>
    </YStack>
  );
}
