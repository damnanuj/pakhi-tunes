import React, { useEffect, useMemo, useRef, useState } from "react";
import UpdateDialog from "../components/UpdateDialog";
import { useAppConfig } from "../hooks/useAppConfig";

interface AppConfigProviderProps {
  children: React.ReactNode;
}

export default function AppConfigProvider({ children }: AppConfigProviderProps) {
  const { data: appConfig } = useAppConfig();
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false);
  const prevFlagsRef = useRef<{
    updateAvailable: boolean;
    forceUpdate: boolean;
    latestVersion: string;
  } | null>(null);

  useEffect(() => {
    if (!appConfig) return;

    const prev = prevFlagsRef.current;
    const next = {
      updateAvailable: appConfig.updateAvailable,
      forceUpdate: appConfig.forceUpdate,
      latestVersion: appConfig.latestVersion,
    };

    if (
      prev &&
      (prev.updateAvailable !== next.updateAvailable ||
        prev.forceUpdate !== next.forceUpdate ||
        prev.latestVersion !== next.latestVersion)
    ) {
      setSoftUpdateDismissed(false);
    }

    prevFlagsRef.current = next;
  }, [
    appConfig?.updateAvailable,
    appConfig?.forceUpdate,
    appConfig?.latestVersion,
  ]);

  const shouldShowDialog = useMemo(() => {
    if (!appConfig) return false;
    if (appConfig.forceUpdate) return true;
    if (!appConfig.updateAvailable) return false;
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
          latestVersion={appConfig.latestVersion}
          releaseSections={appConfig.releaseSections}
          downloadUrl={appConfig.downloadUrl}
          forceUpdate={appConfig.forceUpdate}
        />
      ) : null}
    </>
  );
}
