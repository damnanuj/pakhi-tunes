import type { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ChevronRight,
  Github,
  Globe,
  Heart,
  Instagram,
  LifeBuoy,
  Repeat2,
  Star,
} from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";
import MyText from "src/components/MyText";
import CircularButton from "src/components/CircularButton";
import {
  moderateScale,
  scale,
  verticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";
import { openExternalUrl } from "src/utils/linking/openExternalUrl";
import {
  CREATOR_CONTACT_SUBTITLE,
  CREATOR_CONTACT_TITLE,
  CREATOR_CONTACT_URL,
  CREATOR_GITHUB_URL,
  CREATOR_HANDLE,
  CREATOR_INSTAGRAM_URL,
  CREATOR_REVIEW_SUBTITLE,
  CREATOR_REVIEW_TITLE,
  CREATOR_REVIEW_URL,
  CREATOR_WEBSITE_URL,
} from "../constants/profileCreatorLinks";

const QUOTE_ICON_SIZE = moderateScale(13);
const LINK_ICON_SIZE = moderateScale(20);
const SOCIAL_ICON_SIZE = moderateScale(18);
const LINK_BUTTON_SIZE = moderateScale(36);
const CARD_ICON_SIZE = moderateScale(44);

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
      px={scale(8)}
    >
      <MyText
        fontSize={moderateScale(12)}
        weight="500"
        color={themeColors.dark.textMuted}
        textAlign="center"
      >
        {before}
      </MyText>
      {icon}
      <MyText
        fontSize={moderateScale(12)}
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

function FooterLinkCard({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  accentIcon = false,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
  accentIcon?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      style={styles.linkCard}
    >
      <XStack items="center" gap={scale(14)} flex={1}>
        <View pointerEvents="none">
          <CircularButton size={CARD_ICON_SIZE}>
            {icon}
          </CircularButton>
        </View>

        <YStack flex={1} gap={verticalScale(2)}>
          <MyText
            fontSize={moderateScale(15)}
            weight="600"
            color={themeColors.dark.onSurface}
          >
            {title}
          </MyText>
          <MyText
            fontSize={moderateScale(12)}
            weight="400"
            color={themeColors.dark.textMuted}
          >
            {subtitle}
          </MyText>
        </YStack>

        <ChevronRight
          size={moderateScale(20)}
          color={accentIcon ? themeColors.dark.accent : themeColors.dark.textMuted}
        />
      </XStack>
    </TouchableOpacity>
  );
}

export default function ProfileCreatorFooter() {
  return (
    <YStack
      width="100%"
      items="center"
      gap={verticalScale(14)}
      mt={verticalScale(28)}
      pb={verticalScale(8)}
    >
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDot} />
        <View style={styles.dividerLine} />
      </View>

      <YStack gap={verticalScale(4)} items="center">
        <QuoteLine
          before="Not just made with"
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
            <Repeat2 size={QUOTE_ICON_SIZE} color={themeColors.dark.accent} />
          }
          after="playlists on repeat."
        />
      </YStack>

      <View style={styles.creatorPill}>
        <TouchableOpacity
          onPress={() => void openExternalUrl(CREATOR_WEBSITE_URL)}
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

        <View style={styles.creatorPillDivider} />

        <CompactLinkButton
          icon={<Globe size={SOCIAL_ICON_SIZE} color={themeColors.dark.onSurface} />}
          onPress={() => void openExternalUrl(CREATOR_WEBSITE_URL)}
          accessibilityLabel={`${CREATOR_HANDLE} website`}
        />
        <CompactLinkButton
          icon={<Github size={SOCIAL_ICON_SIZE} color={themeColors.dark.onSurface} />}
          onPress={() => void openExternalUrl(CREATOR_GITHUB_URL)}
          accessibilityLabel={`${CREATOR_HANDLE} on GitHub`}
        />
        <CompactLinkButton
          icon={<Instagram size={SOCIAL_ICON_SIZE} color={themeColors.dark.onSurface} />}
          onPress={() => void openExternalUrl(CREATOR_INSTAGRAM_URL)}
          accessibilityLabel={`${CREATOR_HANDLE} on Instagram`}
        />
      </View>

      <YStack gap={verticalScale(10)} width="100%">
        <FooterLinkCard
          icon={<LifeBuoy size={LINK_ICON_SIZE} color={themeColors.dark.onSurface} />}
          title={CREATOR_CONTACT_TITLE}
          subtitle={CREATOR_CONTACT_SUBTITLE}
          onPress={() => void openExternalUrl(CREATOR_CONTACT_URL)}
          accessibilityLabel={`${CREATOR_CONTACT_TITLE}. ${CREATOR_CONTACT_SUBTITLE}`}
        />

        <FooterLinkCard
          icon={
            <Star
              size={LINK_ICON_SIZE}
              color={themeColors.dark.onAccent}
              fill={themeColors.dark.accent}
            />
          }
          title={CREATOR_REVIEW_TITLE}
          subtitle={CREATOR_REVIEW_SUBTITLE}
          onPress={() => void openExternalUrl(CREATOR_REVIEW_URL)}
          accessibilityLabel={`${CREATOR_REVIEW_TITLE}. ${CREATOR_REVIEW_SUBTITLE}`}
          accentIcon
        />
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: themeColors.dark.borderSecondary,
  },
  dividerDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: themeColors.dark.accent,
  },
  creatorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.dark.surfaceSecondary,
    borderRadius: moderateScale(999),
    paddingLeft: scale(16),
    paddingRight: scale(6),
    paddingVertical: verticalScale(6),
    gap: scale(4),
  },
  creatorPillDivider: {
    width: 1,
    height: verticalScale(18),
    backgroundColor: themeColors.dark.borderSecondary,
    marginHorizontal: scale(4),
  },
  linkCard: {
    width: "100%",
    backgroundColor: themeColors.dark.surfaceSecondary,
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: themeColors.dark.borderSecondary,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
    minHeight: verticalScale(76),
    justifyContent: "center",
  },
});
