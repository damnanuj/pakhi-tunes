export function parseVersion(version: string): number[] | null {
  const raw = String(version ?? "").trim();
  if (!raw) return null;

  const core = raw.split("-")[0].split("+")[0];
  const parts = core.split(".").map((part) => Number.parseInt(part, 10));

  if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  while (parts.length < 3) {
    parts.push(0);
  }

  return parts.slice(0, 3);
}

export function compareVersions(a: string, b: string): number | null {
  const left = parseVersion(a);
  const right = parseVersion(b);

  if (!left || !right) {
    return null;
  }

  for (let index = 0; index < 3; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }

  return 0;
}

export function isVersionAtOrAbove(clientVersion: string, targetVersion: string): boolean {
  const result = compareVersions(clientVersion, targetVersion);
  return result !== null && result >= 0;
}
