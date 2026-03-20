/** Try 320 → 160 → 96 only */
const QUALITY_ORDER = ["320kbps", "160kbps", "96kbps"] as const;

export function getPreferredStreamUrl(
  downloadUrl: { quality: string; url: string }[] | undefined
): string | null {
  if (!downloadUrl?.length) return null;
  for (const q of QUALITY_ORDER) {
    const hit = downloadUrl.find((d) => d.quality === q);
    if (hit?.url) return hit.url;
  }
  return null;
}
