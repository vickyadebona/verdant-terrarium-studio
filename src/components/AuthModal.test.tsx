import { describe, it, expect } from 'vitest';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { signInMockUser } from '../test/authClientMock';

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

function renderAuth({ googleSignInEnabled = false } = {}) {
  render(
    <AuthProvider googleSignInEnabled={googleSignInEnabled}>
      <AuthTestHost />
    </AuthProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Sign In' }));
}

describe('AuthModal', () => {
  it('starts with empty fields and no demo sign-in shortcuts', () => {
    renderAuth();

    expect(screen.getByLabelText('Full Name')).toHaveValue('');
    expect(screen.getByLabelText('Email Address')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.queryByText(/Testing Shortcuts/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign in as/ })).not.toBeInTheDocument();
  });

  it('removes the old prototype accounts and session from this browser', async () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([{ user: { email: 'old@example.test' }, passwordHash: 'old-password' }]));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'usr_old', email: 'old@example.test' }));
    renderAuth();

    expect(screen.getByText('Signed out')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem(USERS_STORAGE_KEY)).toBeNull());
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('creates an account and signs the shopper in', async () => {
    renderAuth();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Collector' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'New@Example.test ' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password-1' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);

    expect(await screen.findByText('Signed in as new@example.test')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('explains when the email already has an account', async () => {
    signInMockUser({ email: 'taken@example.test' });
    renderAuth();
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Someone' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'taken@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password-1' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists. Please sign in.');
  });

  it('rejects a wrong password', async () => {
    renderAuth();
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'nobody@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
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

  it('shows Google sign-in only when it is configured', () => {
    renderAuth();
    expect(screen.queryByRole('button', { name: /Continue with Google/ })).not.toBeInTheDocument();
  });

  it('offers Google sign-in once it is configured', () => {
    renderAuth({ googleSignInEnabled: true });
    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument();
  });
});
