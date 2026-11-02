import type { PaymentPreference } from '../catalog/paymentPreferences';

export type AuthProviderType = 'google' | 'credentials';
export type AuthProvider = AuthProviderType;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: string;
  /** False for accounts that only sign in with Google. Undefined until it has been looked up. */
  hasPassword?: boolean;
  preferredPaymentMethod: PaymentPreference | null;
}

export interface Session {
  user: User | null;
  expires?: string;
  status: 'authenticated' | 'unauthenticated' | 'loading';
}

export interface AuthModalConfig {
  title?: string;
  message?: string;
  /** Finishes the submit button label, e.g. "Add to Greenhouse" → "Sign In & Add to Greenhouse". */
  actionLabel?: string;
  /** Runs once, right after a successful sign-in or sign-up from the dialog. */
  onAuthenticated?: () => void;
}

export interface AuthContextType {
  user: User | null;
  session: Session;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    provider: AuthProvider,
    credentials?: {
      email?: string;
      password?: string;
      name?: string;
      isSignUp?: boolean;
    }
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (changes: {
    name: string;
    preferredPaymentMethod: PaymentPreference | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  /** True when Google sign-in is configured for this environment. */
  googleSignInEnabled: boolean;
  isAuthModalOpen: boolean;
  authModalConfig: AuthModalConfig | null;
  openAuthModal: (config?: AuthModalConfig) => void;
  closeAuthModal: () => void;
}
