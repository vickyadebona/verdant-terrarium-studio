import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthProviderType,
  User,
  Session,
  AuthContextType,
  AuthModalConfig,
} from '../types/auth';

const SESSION_STORAGE_KEY = 'terrascape_auth_session_v1';
const USERS_STORAGE_KEY = 'terrascape_registered_users_v1';

// Pre-seeded demo accounts
const DEFAULT_ACCOUNTS: Array<{ user: User; passwordHash: string }> = [
  {
    user: {
      id: 'usr_vicky_verdant',
      name: 'Vicky Adebona',
      email: 'vicky@verdantstudio.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      provider: 'google',
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'usr_andrew_hardware',
      name: 'Andrew Hung',
      email: 'andrew@terrascape.hardware',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      provider: 'credentials',
      createdAt: '2026-02-01T12:00:00.000Z',
    },
    passwordHash: 'password123',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalConfig, setAuthModalConfig] = useState<AuthModalConfig | null>(null);

  // Initialize registered accounts in localStorage if not present
  useEffect(() => {
    try {
      const existing = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch (e) {
      console.warn('Unable to initialize registered users cache', e);
    }
  }, []);

  // Restore active session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as User;
        setUser(parsed);
      }
    } catch (e) {
      console.warn('Unable to restore auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = useCallback((config?: AuthModalConfig) => {
    setAuthModalConfig(config || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalConfig(null);
  }, []);

  const signIn = useCallback(
    async (
      provider: AuthProviderType,
      credentials?: {
        email?: string;
        password?: string;
        name?: string;
        isSignUp?: boolean;
      }
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsLoading(true);

      // Simulate realistic network round-trip
      await new Promise((resolve) => setTimeout(resolve, 600));

      try {
        let authenticatedUser: User;

        if (provider === 'google') {
          // One-Click Google OAuth (NextAuth / Auth.js standard payload)
          authenticatedUser = {
            id: `usr_g_${Date.now()}`,
            name: credentials?.name || 'Vicky Adebona',
            email: credentials?.email || 'vicky@verdantstudio.com',
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            provider: 'google',
            createdAt: new Date().toISOString(),
          };
        } else {
          // Credentials Provider (Email + Password)
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password || '';
          const name = credentials?.name?.trim();

          if (!email || !password) {
            setIsLoading(false);
            return { ok: false, error: 'Email and password are required' };
          }

          const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
          const usersList: Array<{ user: User; passwordHash: string }> = rawUsers
            ? JSON.parse(rawUsers)
            : DEFAULT_ACCOUNTS;

          if (credentials?.isSignUp) {
            const exists = usersList.find((u) => u.user.email.toLowerCase() === email);
            if (exists) {
              setIsLoading(false);
              return { ok: false, error: 'An account with this email already exists. Please sign in.' };
            }

            authenticatedUser = {
              id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: name || email.split('@')[0],
              email,
              provider: 'credentials',
              createdAt: new Date().toISOString(),
            };

            usersList.push({
              user: authenticatedUser,
              passwordHash: password,
            });

            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
          } else {
            const found = usersList.find(
              (u) => u.user.email.toLowerCase() === email && u.passwordHash === password
            );

            if (!found) {
              setIsLoading(false);
              return { ok: false, error: 'Invalid email or password' };
            }

            authenticatedUser = found.user;
          }
        }

        // Commit active session
        setUser(authenticatedUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
        setIsLoading(false);

        // If an intercept callback was registered, execute it immediately
        const callback = authModalConfig?.onAuthenticated;
        closeAuthModal();

        if (callback) {
          // Slight defer to allow modal state transition to resolve cleanly
          setTimeout(() => {
            callback();
          }, 100);
        }

        return { ok: true };
      } catch (err) {
        setIsLoading(false);
        return { ok: false, error: err instanceof Error ? err.message : 'Authentication failed' };
      }
    },
    [authModalConfig, closeAuthModal]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsLoading(false);
  }, []);

  const session: Session = {
    user,
    status: isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        isAuthModalOpen,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
