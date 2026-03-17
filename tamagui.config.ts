import { defaultConfig } from "@tamagui/config/v4";
import themeColors from "./src/utils/theme/colors";
import { createTamagui } from "tamagui";

const config = createTamagui({
  ...defaultConfig,

  themes: {
    ...defaultConfig.themes,

    dark: {
      ...defaultConfig.themes?.dark,
      background: themeColors.dark.PRIMARY,
      backgroundSecondary: themeColors.dark.SECONDARY,
      textPrimary: themeColors.dark.TEXT_PRIMARY,
      textSecondary: themeColors.dark.TEXT_SECONDARY,
      accentYellow: themeColors.dark.YELLOW,
      accentWhite: themeColors.dark.WHITE,
      accentBlack: themeColors.dark.BLACK,
      accentBlue: themeColors.dark.BLUE,
      accentDarkBg: themeColors.dark.DARK_BG,
      accentGreen: themeColors.dark.GREEN,
      borderPrimary: themeColors.dark.BORDER_PRIMARY,
    },

    light: {
      ...defaultConfig.themes?.light,
      background: themeColors.light.PRIMARY,
      backgroundSecondary: themeColors.light.SECONDARY,
      textPrimary: themeColors.light.TEXT_PRIMARY,
      textSecondary: themeColors.light.TEXT_SECONDARY,
      accentYellow: themeColors.light.YELLOW,
      accentWhite: themeColors.light.WHITE,
      accentBlack: themeColors.light.BLACK,
      accentBlue: themeColors.light.BLUE,
      accentDarkBg: themeColors.light.DARK_BG,
      accentGreen: themeColors.dark.GREEN,
      borderPrimary: themeColors.light.BORDER_PRIMARY,
    },
  },
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
