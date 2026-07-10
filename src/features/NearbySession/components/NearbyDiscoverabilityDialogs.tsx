import ConfirmDialog from "src/components/ConfirmDialog";
import {
  DIALOG_ALLOW,
  DIALOG_CANCEL,
  DIALOG_SETTINGS,
  LOCATION_PERMISSION_MESSAGE,
  LOCATION_PERMISSION_SUBTITLE,
  LOCATION_PERMISSION_TITLE,
  LOCATION_SETTINGS_MESSAGE,
  openAppSettings,
} from "../utils/locationPermission";

type NearbyDiscoverabilityDialogsProps = {
  showPermissionInfo: boolean;
  setShowPermissionInfo: (open: boolean) => void;
  showSettingsPrompt: boolean;
  setShowSettingsPrompt: (open: boolean) => void;
  onPermissionConfirm: () => void;
};

export default function NearbyDiscoverabilityDialogs({
  showPermissionInfo,
  setShowPermissionInfo,
  showSettingsPrompt,
  setShowSettingsPrompt,
  onPermissionConfirm,
}: NearbyDiscoverabilityDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={showPermissionInfo}
        onOpenChange={setShowPermissionInfo}
        title={LOCATION_PERMISSION_TITLE}
        subtitle={LOCATION_PERMISSION_SUBTITLE}
        message={LOCATION_PERMISSION_MESSAGE}
        confirmLabel={DIALOG_ALLOW}
        cancelLabel={DIALOG_CANCEL}
        onConfirm={onPermissionConfirm}
      />

      <ConfirmDialog
        open={showSettingsPrompt}
        onOpenChange={setShowSettingsPrompt}
        title={LOCATION_PERMISSION_TITLE}
        subtitle={LOCATION_PERMISSION_SUBTITLE}
        message={LOCATION_SETTINGS_MESSAGE}
        confirmLabel={DIALOG_SETTINGS}
        cancelLabel={DIALOG_CANCEL}
        onConfirm={() => void openAppSettings()}
      />
    </>
  );
}
