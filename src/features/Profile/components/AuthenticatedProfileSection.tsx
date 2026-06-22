import { YStack } from "tamagui";
import { verticalScale } from "src/utils/functions/dimensions";
import ProfileSection from "./ProfileSection";
import type { AuthUser } from "src/features/auth/types/auth.types";

const GUEST_AVATAR = require("../../../../assets/images/icon.png");

type AuthenticatedProfileSectionProps = {
  user: AuthUser;
};

export default function AuthenticatedProfileSection({
  user,
}: AuthenticatedProfileSectionProps) {
  return (
    <YStack >
      <ProfileSection
        avatarSource={GUEST_AVATAR}
        name={user.name}
        subtitle={user.email}
        showEditButton={false}
      />
    </YStack>
  );
}
