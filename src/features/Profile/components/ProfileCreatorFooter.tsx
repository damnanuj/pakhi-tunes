import type { ReactNode } from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Github, Globe, Heart, Repeat2 } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import {
  CREATOR_GITHUB_URL,
  CREATOR_HANDLE,
  CREATOR_WEBSITE_URL,
} from "../constants/profileCreatorLinks";

const QUOTE_ICON_SIZE = moderateScale(13);
const LINK_ICON_SIZE = moderateScale(18);
const LINK_BUTTON_SIZE = moderateScale(36);

async function openLink(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore link open failures.
    }
  }
}

function QuoteLine({
  before,
  icon,
  after,
}: {
  before: string;
  icon: ReactNode;
  after: string;
}) {
  return (
    <XStack
      items="center"
      justify="center"
      gap={scale(4)}
      flexWrap="wrap"
      px={scale(16)}
    >
      <MyText
        fontSize={moderateScale(13)}
        weight="500"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        {before}
      </MyText>
      {icon}
      <MyText
        fontSize={moderateScale(13)}
        weight="500"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        {after}
      </MyText>
    </XStack>
  );
}

function CompactLinkButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={{
          width: LINK_BUTTON_SIZE,
          height: LINK_BUTTON_SIZE,
          borderRadius: LINK_BUTTON_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileCreatorFooter() {
  return (
    <YStack
      items="center"
      gap={verticalScale(16)}
      mt={verticalScale(32)}
      pb={verticalScale(8)}
    >
      <YStack gap={verticalScale(6)} items="center" width="100%">
        <QuoteLine
          before="Not made with"
          icon={
            <Heart
              size={QUOTE_ICON_SIZE}
              color={themeColors.dark.textMuted}
              fill={themeColors.dark.textMuted}
            />
          }
          after="love."
        />
        <QuoteLine
          before="Made with"
          icon={
            <Repeat2
              size={QUOTE_ICON_SIZE}
              color={themeColors.dark.accent}
            />
          }
          after="playlists on repeat."
        />
      </YStack>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: themeColors.dark.surfaceSecondary,
          borderRadius: moderateScale(999),
          paddingLeft: scale(16),
          paddingRight: scale(6),
          paddingVertical: verticalScale(6),
          gap: scale(4),
        }}
      >
        <TouchableOpacity
          onPress={() => void openLink(CREATOR_WEBSITE_URL)}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={`Open ${CREATOR_HANDLE} website`}
        >
          <MyText
            fontSize={moderateScale(14)}
            weight="700"
            color={themeColors.dark.onSurface}
          >
            {CREATOR_HANDLE}
          </MyText>
        </TouchableOpacity>

        <View
          style={{
            width: 1,
            height: verticalScale(18),
            backgroundColor: themeColors.dark.borderSecondary,
            marginHorizontal: scale(4),
          }}
        />

        <CompactLinkButton
          icon={<Globe size={LINK_ICON_SIZE} color={themeColors.dark.onSurface} />}
          onPress={() => void openLink(CREATOR_WEBSITE_URL)}
          accessibilityLabel={`${CREATOR_HANDLE} website`}
        />
        <CompactLinkButton
          icon={<Github size={LINK_ICON_SIZE} color={themeColors.dark.onSurface} />}
          onPress={() => void openLink(CREATOR_GITHUB_URL)}
          accessibilityLabel={`${CREATOR_HANDLE} on GitHub`}
        />
      </View>
    </YStack>
  );
}
