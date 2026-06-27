let positionSyncSuspendedUntilMs = 0;

export function suspendPositionSyncFromStatusForMs(ms: number) {
  const until = Date.now() + ms;
  if (until > positionSyncSuspendedUntilMs) {
    positionSyncSuspendedUntilMs = until;
  }
}

export function isPositionSyncSuspended() {
  return Date.now() < positionSyncSuspendedUntilMs;
}

export function resetPositionSyncSuspension() {
  positionSyncSuspendedUntilMs = 0;
}
