import { useSyncExternalStore } from 'react';

/**
 * In-memory stand-in for the Better Auth browser client (src/lib/authClient.ts), so component
 * tests run without a server or database. Accounts and the session reset before every test.
 */
type MockUser = { id: string; name: string; email: string; image: string | null; createdAt: Date };
type MockSession = { user: MockUser; session: { expiresAt: Date } } | null;
type MockError = { code: string; status: number; message: string };

let accounts = new Map<string, { user: MockUser; password: string; providerId: string }>();
let current: MockSession = null;
const listeners = new Set<() => void>();

function setSession(user: MockUser | null) {
  current = user ? { user, session: { expiresAt: new Date(Date.now() + 7 * 864e5) } } : null;
  listeners.forEach((listener) => listener());
}

const fail = (code: string, status: number, message: string) => ({ data: null, error: { code, status, message } as MockError });

export function resetMockAuth() {
  accounts = new Map();
  current = null;
}

/** Starts the test signed in, as a returning shopper with a saved session would be. */
export function signInMockUser(user: Partial<MockUser> & { email?: string } = {}, providerId = 'credential') {
  const full: MockUser = {
    id: 'usr_test_collector',
    name: 'Test Collector',
    email: 'collector@example.test',
    image: null,
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
    ...user,
  };
  accounts.set(full.email, { user: full, password: 'test-password-1', providerId });
  setSession(full);
}

export const authClient = {
  useSession() {
    const data = useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      () => current,
      () => current
    );
    return { data, isPending: false, error: null };
  },
  signUp: {
    async email({ email, password, name }: { email: string; password: string; name: string }) {
      if (accounts.has(email)) return fail('USER_ALREADY_EXISTS', 422, 'User already exists');
      const user: MockUser = { id: `usr_${accounts.size + 1}`, name, email, image: null, createdAt: new Date() };
      accounts.set(email, { user, password, providerId: 'credential' });
      setSession(user);
      return { data: { user }, error: null };
    },
  },
  signIn: {
    async email({ email, password }: { email: string; password: string }) {
      const account = accounts.get(email);
      if (!account || account.password !== password) {
        return fail('INVALID_EMAIL_OR_PASSWORD', 401, 'Invalid email or password');
      }
      setSession(account.user);
      return { data: { user: account.user }, error: null };
    },
    async social(_options: { provider: string; callbackURL?: string }) {
      return { data: { redirect: true }, error: null };
    },
  },
  async signOut() {
    setSession(null);
    return { data: { success: true }, error: null };
  },
  async listAccounts() {
    const account = current ? accounts.get(current.user.email) : undefined;
    return { data: account ? [{ providerId: account.providerId }] : [], error: null };
  },
};
