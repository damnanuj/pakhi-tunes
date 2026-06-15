import { Button, Image, Stack } from "tamagui";
import { Ban } from "@tamagui/lucide-icons";
import MyText from "src/components/MyText";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

interface DisabledGoogleAuthButtonProps {
  label: string;
}

function GoogleIcon({ size }: { size: number }) {
  return (
    <Image
      src={"https://img.icons8.com/fluency/48/google-logo.png"}
      alt="google-logo"
      height={moderateScale(size)}
      width={moderateScale(size)}
    />
  );
}

export default function DisabledGoogleAuthButton({
  label,
}: DisabledGoogleAuthButtonProps) {
  return (
    <Stack width="100%" position="relative">
      <Button
        width="100%"
        borderWidth={moderateScale(1.5, 0.3)}
        borderColor={themeColors.dark.textMuted}
        size="$4"
        bg="transparent"
        icon={<GoogleIcon size={30} />}
        disabled
        opacity={0.45}
        pointerEvents="none"
      >
        <MyText color={"$textSecondary"}>{label}</MyText>
      </Button>
      <Stack
        position="absolute"
        t={-moderateScale(6)}
        r={scale(10)}
        bg="$background"
        rounded={999}
        borderWidth={moderateScale(1)}
        borderColor={themeColors.dark.textMuted}
        p={moderateScale(4)}
        items="center"
        justify="center"
      >
        <Ban size={moderateScale(12)} color={themeColors.dark.textMuted} />
      </Stack>
    </Stack>
  );
}
