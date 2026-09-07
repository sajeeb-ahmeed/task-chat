'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Session } from '@/lib/types';
type Auth = {
  session: Session | null;
  ready: boolean;
  error: string;
  login: (session: Session) => void;
  logout: () => void;
  retry: () => void;
};
const AuthContext = createContext<Auth | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('Missing auth provider');
  return value;
}
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15000,
            retry: (count, error) =>
              !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
              count < 1,
          },
          mutations: { retry: false },
        },
      }),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const logout = useCallback(() => {
    sessionStorage.removeItem('thread.session');
    setSession(null);
    client.clear();
    setReady(true);
    setError('');
  }, [client]);
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      let saved: Session | null = null;
      try {
        saved = JSON.parse(sessionStorage.getItem('thread.session') || 'null');
      } catch {
        sessionStorage.removeItem('thread.session');
      }
      if (!saved?.token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const user = await api.me(saved.token);
        if (!cancelled) {
          setSession({ token: saved.token, user });
          setError('');
        }
      } catch (e) {
        if (!cancelled && !(e instanceof ApiError && (e.status === 401 || e.code === 'NO_TOKEN')))
          setError(e instanceof Error ? e.message : 'Could not restore your session.');
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void restore();
    window.addEventListener('thread:session-expired', logout);
    return () => {
      cancelled = true;
      window.removeEventListener('thread:session-expired', logout);
    };
  }, [attempt, logout]);
  const login = (value: Session) => {
    client.clear();
    sessionStorage.setItem('thread.session', JSON.stringify(value));
    setSession(value);
    setReady(true);
    setError('');
  };
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          session,
          ready,
          error,
          login,
          logout,
          retry: () => {
            setReady(false);
            setAttempt((a) => a + 1);
          },
        }}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
