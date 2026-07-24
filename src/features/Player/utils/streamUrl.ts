import { getStreamQualityFallbackOrder } from "../constants/streamQualityOptions";
import { useStreamQualityStore } from "../store/streamQualityStore";

export function getPreferredStreamUrl(
  downloadUrl: { quality: string; url: string }[] | undefined
): string | null {
  if (!downloadUrl?.length) return null;

  const preferred = useStreamQualityStore.getState().quality;
  const order = getStreamQualityFallbackOrder(preferred);

  for (const q of order) {
    const hit = downloadUrl.find((d) => d.quality === q);
    if (hit?.url) return hit.url;
  }
  return null;
}
