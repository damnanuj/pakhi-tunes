import { stopHostSession } from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";

/**
 * End a hosted session through a single path.
 *
 * The socket is preferred because the server acknowledges only after listeners
 * have been notified. REST is a fallback for a dead/hung socket; the backend
 * broadcasts from that path too, so listeners still exit either way.
 */
export async function endHostSession(sessionId: string): Promise<boolean> {
  const ack = await sessionSocketService.emitHostStop();
  if (ack.ok) return true;

  try {
    await stopHostSession(sessionId);
    return true;
  } catch {
    // Nothing left to try; the room expires server-side on its own.
    return false;
  }
}
