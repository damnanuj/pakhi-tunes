import type { ReleaseSection } from "../types/appConfig.types";

export function normalizeReleaseSections(
  sections: ReleaseSection[] | undefined | null
): ReleaseSection[] {
  if (!Array.isArray(sections)) return [];

  return sections
    .map((section) => ({
      title: String(section?.title ?? "").trim(),
      items: Array.isArray(section?.items)
        ? section.items.map((item) => String(item ?? "").trim()).filter(Boolean)
        : [],
    }))
    .filter((section) => section.title.length > 0 && section.items.length > 0);
}

export function hasNonEmptyText(value: string | undefined | null): boolean {
  return Boolean(String(value ?? "").trim());
}
