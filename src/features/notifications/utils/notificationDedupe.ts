/**
 * In-memory dedupe of recently handled FCM message IDs.
 */
const MAX_IDS = 100;
const seenIds = new Set<string>();
const order: string[] = [];

export function isDuplicateNotification(messageId: string | undefined): boolean {
  if (!messageId) return false;
  if (seenIds.has(messageId)) return true;

  seenIds.add(messageId);
  order.push(messageId);

  if (order.length > MAX_IDS) {
    const oldest = order.shift();
    if (oldest) seenIds.delete(oldest);
  }

  return false;
}
