/** Shared lock so host room-advance and play-next mirror cannot nest. */
let roomAdvanceInFlight = false;

export function isRoomAdvanceInFlight() {
  return roomAdvanceInFlight;
}

export function setRoomAdvanceInFlight(value: boolean) {
  roomAdvanceInFlight = value;
}

/** Last room-queue head the host already consumed locally (stale-echo guard). */
let lastConsumedQueueItemId: string | null = null;
let expectedQueueLengthAfterConsume: number | null = null;

export function markRoomQueueHeadConsumed(
  queueItemId: string,
  remainingLength: number
) {
  lastConsumedQueueItemId = queueItemId;
  expectedQueueLengthAfterConsume = remainingLength;
}

export function getLastConsumedRoomQueueMeta() {
  return {
    queueItemId: lastConsumedQueueItemId,
    expectedLength: expectedQueueLengthAfterConsume,
  };
}

export function clearLastConsumedRoomQueueMeta() {
  lastConsumedQueueItemId = null;
  expectedQueueLengthAfterConsume = null;
}

/**
 * True when an incoming queueUpdated still shows the head we already consumed
 * and the length matches the pre-consume size (pure stale echo).
 * Length growth (e.g. listener added behind the consumed head) is not stale.
 */
export function isStaleConsumedQueueEcho(
  queue: { queueItemId: string }[]
): boolean {
  if (!lastConsumedQueueItemId) return false;
  const headId = queue[0]?.queueItemId;

  if (headId !== lastConsumedQueueItemId) {
    if (!queue.some((item) => item.queueItemId === lastConsumedQueueItemId)) {
      clearLastConsumedRoomQueueMeta();
    }
    return false;
  }

  const expectedPreConsumeLength =
    expectedQueueLengthAfterConsume !== null
      ? expectedQueueLengthAfterConsume + 1
      : null;

  // Only drop when this looks like the exact pre-consume snapshot echoed back.
  if (
    expectedPreConsumeLength !== null &&
    queue.length === expectedPreConsumeLength
  ) {
    return true;
  }

  return false;
}
