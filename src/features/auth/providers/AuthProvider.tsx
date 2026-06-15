import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return children;
}
