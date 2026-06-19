import ConnectionErrorState from "src/components/ConnectionErrorState";

interface OfflineFallbackProps {
  title?: string;
  subtitle?: string;
  showDownloadsCta?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function OfflineFallback({
  title,
  subtitle,
  showDownloadsCta = true,
  onRetry,
  isRetrying,
}: OfflineFallbackProps) {
  return (
    <ConnectionErrorState
      variant="offline"
      title={title}
      subtitle={
        subtitle ??
        "Downloaded songs are available in your Library. Check your connection and try again."
      }
      onRetry={onRetry}
      isRetrying={isRetrying}
      showDownloadsCta={showDownloadsCta}
    />
  );
}
