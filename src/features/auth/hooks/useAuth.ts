import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isHydrated,
    setSession,
    setUser,
    logout,
  };
}
