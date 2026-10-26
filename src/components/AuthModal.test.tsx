import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { AllProviders } from '../test/test-utils';
import { useAuth } from '../context/AuthContext';

const USERS_STORAGE_KEY = 'terrascape_registered_users_v1';
const SESSION_STORAGE_KEY = 'terrascape_auth_session_v1';

function AuthTestHost() {
  const { openAuthModal, user } = useAuth();
  return (
    <div>
      <button onClick={() => openAuthModal()}>Open Sign In</button>
      <p>{user ? `Signed in as ${user.email}` : 'Signed out'}</p>
      <AuthModal />
    </div>
  );
}

function renderAuth() {
  render(
    <AllProviders>
      <AuthTestHost />
    </AllProviders>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Sign In' }));
}

const legacyAccount = {
  user: {
    id: 'usr_vicky_verdant',
    name: 'Legacy Demo',
    email: 'legacy@example.test',
    provider: 'google',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  passwordHash: 'legacy-shared-password',
};

describe('AuthModal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts with empty fields and no demo sign-in shortcuts', () => {
    renderAuth();

    expect(screen.getByLabelText('Full Name')).toHaveValue('');
    expect(screen.getByLabelText('Email Address')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.queryByText(/Testing Shortcuts/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign in as/ })).not.toBeInTheDocument();
  });

  it('removes the legacy seeded accounts and their session from this browser', async () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([legacyAccount]));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(legacyAccount.user));
    renderAuth();

    expect(screen.getByText('Signed out')).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? '[]')).toEqual([]));
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: legacyAccount.user.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: legacyAccount.passwordHash } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);

    expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent('Invalid email or password');
  });

  it('rejects sign-up passwords shorter than 8 characters', async () => {
    renderAuth();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Collector' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'new@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);

    expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent(
      'Use at least 8 characters for your password.'
    );
  });

  it('hides the simulated Google sign-in outside development builds', () => {
    vi.stubEnv('DEV', false);
    renderAuth();
    expect(screen.queryByRole('button', { name: /Continue with Google/ })).not.toBeInTheDocument();
  });
});
