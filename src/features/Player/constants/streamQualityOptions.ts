export type StreamQuality = "96kbps" | "160kbps" | "320kbps";

export const DEFAULT_STREAM_QUALITY: StreamQuality = "320kbps";

export const STREAM_QUALITY_OPTIONS: {
  quality: StreamQuality;
  label: string;
}[] = [
  { quality: "320kbps", label: "High" },
  { quality: "160kbps", label: "Medium" },
  { quality: "96kbps", label: "Low" },
];

const QUALITY_RANK: StreamQuality[] = ["320kbps", "160kbps", "96kbps"];

export function getStreamQualityLabel(quality: StreamQuality): string {
  const option = STREAM_QUALITY_OPTIONS.find((o) => o.quality === quality);
  return option ? `${option.label} · ${option.quality}` : quality;
}

/** Preferred first, then lower bitrates, then higher. */
export function getStreamQualityFallbackOrder(
  preferred: StreamQuality
): StreamQuality[] {
  const start = QUALITY_RANK.indexOf(preferred);
  if (start < 0) return [...QUALITY_RANK];
  const lowerOrEqual = QUALITY_RANK.slice(start);
  const higher = QUALITY_RANK.slice(0, start).reverse();
  return [...lowerOrEqual, ...higher];
}
