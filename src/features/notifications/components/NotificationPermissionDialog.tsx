import ConfirmDialog from "src/components/ConfirmDialog";
import {
  NOTIFICATION_DIALOG_ALLOW,
  NOTIFICATION_DIALOG_NOT_NOW,
  NOTIFICATION_PERMISSION_MESSAGE,
  NOTIFICATION_PERMISSION_SUBTITLE,
  NOTIFICATION_PERMISSION_TITLE,
} from "../utils/notificationPermission";

type NotificationPermissionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllow: () => void;
};

export default function NotificationPermissionDialog({
  open,
  onOpenChange,
  onAllow,
}: NotificationPermissionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={NOTIFICATION_PERMISSION_TITLE}
      subtitle={NOTIFICATION_PERMISSION_SUBTITLE}
      message={NOTIFICATION_PERMISSION_MESSAGE}
      confirmLabel={NOTIFICATION_DIALOG_ALLOW}
      cancelLabel={NOTIFICATION_DIALOG_NOT_NOW}
      onConfirm={onAllow}
    />
  );
}
