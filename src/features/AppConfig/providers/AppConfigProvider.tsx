import React, { useMemo, useState } from "react";
import UpdateDialog from "../components/UpdateDialog";
import { useAppConfig } from "../hooks/useAppConfig";

interface AppConfigProviderProps {
  children: React.ReactNode;
}

export default function AppConfigProvider({ children }: AppConfigProviderProps) {
  const { data: appConfig } = useAppConfig();
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false);

  const shouldShowDialog = useMemo(() => {
    if (!appConfig?.updateAvailable) return false;
    if (appConfig.forceUpdate) return true;
    return !softUpdateDismissed;
  }, [appConfig, softUpdateDismissed]);

  const handleOpenChange = (open: boolean) => {
    if (!appConfig || appConfig.forceUpdate) return;
    if (!open) {
      setSoftUpdateDismissed(true);
    }
  };

  return (
    <>
      {children}
      {appConfig && shouldShowDialog ? (
        <UpdateDialog
          open
          onOpenChange={handleOpenChange}
          title={appConfig.title}
          message={appConfig.message}
          downloadUrl={appConfig.downloadUrl}
          forceUpdate={appConfig.forceUpdate}
        />
      ) : null}
    </>
  );
}
