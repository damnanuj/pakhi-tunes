/**
 * Decodes common HTML entities in strings from API responses.
 * e.g. "Rana Kumbha (From &quot;Varanasi&quot;)" → "Rana Kumbha (From "Varanasi")"
 */
export function decodeHtmlEntities(str: string | null | undefined): string {
  if (str == null || typeof str !== "string") return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
