/** Formats playback position/duration millis as m:ss or h:mm:ss. */
export function formatMillisToClock(millis: number): string {
  if (!Number.isFinite(millis) || millis < 0) return "–:–";
  const totalSec = Math.floor(millis / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
