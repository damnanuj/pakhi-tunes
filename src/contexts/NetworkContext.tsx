import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import { deriveOffline } from "src/utils/network/deriveOffline";

type NetworkContextValue = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  bannerPhase: "hidden" | "offline" | "reconnected";
  dismissBanner: () => void;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);
  const [bannerPhase, setBannerPhase] =
    useState<NetworkContextValue["bannerPhase"]>("hidden");
  const wasOfflineRef = useRef(false);
  const reconnectAckActiveRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const RECONNECT_BANNER_MS = 2500;

  useEffect(() => {
    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      const reachable = state.isInternetReachable;
      const offline = deriveOffline(state);

      setIsConnected(connected);
      setIsInternetReachable(reachable);

      if (offline) {
        clearReconnectTimer();
        reconnectAckActiveRef.current = false;
        wasOfflineRef.current = true;
        setBannerPhase("offline");
        return;
      }

      if (reconnectAckActiveRef.current) {
        return;
      }

      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        reconnectAckActiveRef.current = true;
        setBannerPhase("reconnected");
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAckActiveRef.current = false;
          setBannerPhase("hidden");
        }, RECONNECT_BANNER_MS);
        return;
      }

      setBannerPhase("hidden");
    });

    void NetInfo.fetch().then((state) => {
      const offline = deriveOffline(state);
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
      if (offline) {
        wasOfflineRef.current = true;
        setBannerPhase("offline");
      }
    });

    return () => {
      clearReconnectTimer();
      unsubscribe();
    };
  }, []);

  const dismissBanner = () => {
    reconnectAckActiveRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setBannerPhase("hidden");
  };

  const isOffline = useMemo(() => {
    if (!isConnected) return true;
    if (isInternetReachable === false) return true;
    return false;
  }, [isConnected, isInternetReachable]);

  const value = useMemo(
    () => ({
      isConnected,
      isInternetReachable,
      isOffline,
      bannerPhase,
      dismissBanner,
    }),
    [bannerPhase, dismissBanner, isConnected, isInternetReachable, isOffline]
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return ctx;
}
