"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/authClient';
import type {
  AuthProviderType,
  User,
  Session,
  AuthContextType,
  AuthModalConfig,
} from '../types/auth';

// The prototype kept accounts (with plain-text passwords) and the signed-in user in
// localStorage. Accounts now live in the database, so remove those keys from any browser
// that still has them.
const LEGACY_STORAGE_KEYS = ['terrascape_auth_session_v1', 'terrascape_registered_users_v1'];

type AuthErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

/** Turns Better Auth's error codes into the messages shoppers see. */
function describeAuthError(error: AuthErrorLike, fallback: string): string {
  if (error?.status === 429) return 'Too many attempts. Please wait a minute and try again.';
  switch (error?.code) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'An account with this email already exists. Please sign in.';
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'Invalid email or password';
    case 'PASSWORD_TOO_SHORT':
      return 'Use at least 8 characters for your password.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
    default:
      return error?.message || fallback;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; googleSignInEnabled?: boolean }> = ({
  children,
  googleSignInEnabled = false,
}) => {
  const { data: sessionData, isPending } = authClient.useSession();
  const [isBusy, setIsBusy] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalConfig, setAuthModalConfig] = useState<AuthModalConfig | null>(null);
  // How the signed-in shopper signs in (shown on the account page), looked up per user.
  const [signInMethod, setSignInMethod] = useState<{ userId: string; provider: AuthProviderType } | null>(null);

  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
    } catch {
      // Storage unavailable: nothing to clean up.
    }
  }, []);

  const sessionUser = sessionData?.user ?? null;
  const userId = sessionUser?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    authClient.listAccounts().then(({ data }) => {
      if (cancelled || !data) return;
      const provider = data.some((account) => account.providerId === 'google') ? 'google' : 'credentials';
      setSignInMethod({ userId, provider });
    }).catch(() => {
      // Not critical: the account page falls back to email & password.
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user: User | null = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        avatarUrl: sessionUser.image ?? undefined,
        provider: signInMethod?.userId === sessionUser.id ? signInMethod.provider : 'credentials',
        createdAt: new Date(sessionUser.createdAt).toISOString(),
      }
    : null;

  const isLoading = isPending || isBusy;

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
      setIsBusy(true);
      try {
        if (provider === 'google') {
          if (!googleSignInEnabled) {
            return { ok: false, error: 'Google sign-in is not available yet. Please use email instead.' };
          }
          // Leaves the site for Google and comes back to this page signed in.
          const { error } = await authClient.signIn.social({
            provider: 'google',
            callbackURL: window.location.pathname + window.location.search,
          });
          if (error) return { ok: false, error: describeAuthError(error, 'Google sign-in failed') };
          return { ok: true };
        }

        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || '';
        if (!email || !password) {
          return { ok: false, error: 'Email and password are required' };
        }

        if (credentials?.isSignUp) {
          if (password.length < 8) {
            return { ok: false, error: 'Use at least 8 characters for your password.' };
          }
          const { error } = await authClient.signUp.email({
            email,
            password,
            name: credentials.name?.trim() || email.split('@')[0],
          });
          if (error) return { ok: false, error: describeAuthError(error, 'Sign up failed') };
        } else {
          const { error } = await authClient.signIn.email({ email, password });
          if (error) return { ok: false, error: describeAuthError(error, 'Invalid email or password') };
        }

        // If an intercept callback was registered, run it once the dialog has closed.
        const callback = authModalConfig?.onAuthenticated;
        closeAuthModal();
        if (callback) setTimeout(callback, 100);

        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Authentication failed' };
      } finally {
        setIsBusy(false);
      }
    },
    [authModalConfig, closeAuthModal, googleSignInEnabled]
  );

  const signOut = useCallback(async () => {
    setIsBusy(true);
    try {
      await authClient.signOut();
    } finally {
      setIsBusy(false);
    }
  }, []);

  const session: Session = {
    user,
    status: isPending ? 'loading' : user ? 'authenticated' : 'unauthenticated',
    expires: sessionData?.session.expiresAt
      ? new Date(sessionData.session.expiresAt).toISOString()
      : undefined,
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
        googleSignInEnabled,
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
