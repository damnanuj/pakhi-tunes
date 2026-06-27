type RemoteHandlers = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (millis: number) => void;
};

let remoteHandlers: RemoteHandlers | null = null;

export function setPlaybackRemoteHandlers(handlers: RemoteHandlers | null) {
  remoteHandlers = handlers;
}

export function getPlaybackRemoteHandlers(): RemoteHandlers | null {
  return remoteHandlers;
}
