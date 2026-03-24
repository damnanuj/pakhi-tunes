/** Display label for API language codes (e.g. `hindi` → `Hindi`). */
export function formatLanguageLabel(code: string): string {
  if (!code.trim()) return "";
  const lower = code.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
