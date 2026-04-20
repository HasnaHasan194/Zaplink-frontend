import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiJson, setStoredUser, setToken, loadStoredSession } from '../api/client';

export type AuthUser = { id: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    () => loadStoredSession().user,
  );
  const [token, setTokenState] = useState<string | null>(
    () => loadStoredSession().token,
  );
  const [isReady] = useState(true);

  useEffect(() => {
    const s = loadStoredSession();
    if (s.token && !s.user) {
      setToken(null);
      setStoredUser(null);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const applySession = useCallback(
    (accessToken: string, nextUser: AuthUser) => {
      setToken(accessToken);
      setStoredUser(nextUser);
      setTokenState(accessToken);
      setUser(nextUser);
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiJson<{ access_token: string; user: AuthUser }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      );
      applySession(res.access_token, res.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      const res = await apiJson<{ access_token: string; user: AuthUser }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, passwordConfirm }),
        },
      );
      applySession(res.access_token, res.user);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await apiJson('/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
      setStoredUser(null);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      register,
      logout,
    }),
    [user, token, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
