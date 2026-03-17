import { defaultConfig } from "@tamagui/config/v4";
import themeColors from "./src/utils/theme/colors";
import { createTamagui } from "tamagui";

const config = createTamagui({
  ...defaultConfig,

  themes: {
    ...defaultConfig.themes,

    dark: {
      ...defaultConfig.themes?.dark,
      background: themeColors.dark.background,
      backgroundSecondary: themeColors.dark.surfaceSecondary,
      textPrimary: themeColors.dark.onSurface,
      textSecondary: themeColors.dark.textMuted,
      accentYellow: themeColors.dark.accent,
      accentWhite: themeColors.dark.onSurface,
      accentBlack: themeColors.dark.onAccent,
      accentBlue: themeColors.dark.accent,
      accentDarkBg: themeColors.dark.background,
      accentGreen: themeColors.dark.accent,
      borderPrimary: themeColors.dark.border,
    },

    light: {
      ...defaultConfig.themes?.light,
      background: themeColors.light.background,
      backgroundSecondary: themeColors.light.surfaceSecondary,
      textPrimary: themeColors.light.onSurface,
      textSecondary: themeColors.light.textMuted,
      accentYellow: themeColors.light.accent,
      accentWhite: themeColors.light.onSurface,
      accentBlack: themeColors.light.onAccent,
      accentBlue: themeColors.light.accent,
      accentDarkBg: themeColors.light.background,
      accentGreen: themeColors.light.accent,
      borderPrimary: themeColors.light.border,
    },
  },
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
