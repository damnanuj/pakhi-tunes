import type { Socket } from "socket.io-client";
import { sessionSocketService } from "../services/sessionSocket.service";

const CONNECT_TIMEOUT_MS = 5_000;

/** Connect the session socket and wait until connected (or timeout). */
export async function connectSessionSocketReady(): Promise<Socket | null> {
  const socket = sessionSocketService.connect();
  if (!socket) return null;

  await new Promise<void>((resolve) => {
    if (socket.connected) {
      resolve();
      return;
    }
    socket.once("connect", () => resolve());
    setTimeout(resolve, CONNECT_TIMEOUT_MS);
  });

  return socket;
}
