import { TamaguiProvider, type TamaguiProviderProps } from "tamagui";
import CustomSafeArea from "providers/CustomSafeArea";
import config from "tamagui.config";
import { useThemeController } from "src/context/theme-context";

export default function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) {
  const { theme } = useThemeController();

  return (
    <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
      <CustomSafeArea>{children}</CustomSafeArea>
    </TamaguiProvider>
  );
}
