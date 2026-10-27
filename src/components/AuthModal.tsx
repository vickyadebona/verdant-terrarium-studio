import React, { useState } from 'react';
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDialogFocus } from '../hooks/useDialogFocus';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalConfig, closeAuthModal, signIn } = useAuth();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dialogRef = useDialogFocus(isAuthModalOpen, () => {
    if (!isLoading) closeAuthModal();
  });

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const res = await signIn('credentials', {
          name: fullName.trim(),
          email: email.trim(),
          password,
          isSignUp: true,
        });
        if (!res.ok) {
          throw new Error(res.error || 'Sign up failed');
        }
      } else {
        const res = await signIn('credentials', {
          email: email.trim(),
          password,
        });
        if (!res.ok) {
          throw new Error(res.error || 'Sign in failed');
        }
      }

      // signIn() closes this dialog and runs authModalConfig.onAuthenticated itself.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await signIn('google');
      if (!res.ok) {
        throw new Error(res.error || 'Google sign-in failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#18392b]/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#f8f5ee] border border-[rgba(24,57,43,0.16)] rounded-2xl shadow-2xl p-5 sm:p-7 overflow-hidden text-[#18392b] max-h-[92vh] flex flex-col">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#657a4e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#b8c2a1]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(184,194,161,0.35)] border border-[rgba(24,57,43,0.16)] flex items-center justify-center text-[#18392b] shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#657a4e] font-semibold">
                TerraScape Account Required
              </p>
              <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-[#18392b] font-serif">
                {authModalConfig?.title || 'Save Your Living World'}
              </h2>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#546358] hover:text-[#18392b] hover:bg-[rgba(24,57,43,0.06)] transition cursor-pointer"
            title="Cancel and return to Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation Banner */}
        <p className="text-xs sm:text-sm text-[#546358] leading-relaxed mb-5">
          {authModalConfig?.message ||
            'Every TerraScape is an individually serialized living ecosystem. An account is required so our team can attach your coordinate blueprint to your workshop build tray and live order tracker.'}
        </p>

        <div className="overflow-y-auto pr-1">
          {/* Google sign-in is simulated until Phase 3 auth, so it only shows in development builds. */}
          {process.env.NODE_ENV !== "production" && (
          <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-[rgba(24,57,43,0.18)] bg-[#f0ede3] hover:bg-[#eae5d8] text-[#18392b] text-sm font-medium flex items-center justify-center gap-2.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {/* Google SVG Brand Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(24,57,43,0.14)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#f8f5ee] px-2.5 text-[#546358] uppercase tracking-wider text-[10px] font-semibold">
                Or with email
              </span>
            </div>
          </div>
          </>
          )}

          {/* Tab Switcher: Create Account vs Sign In */}
          <div className="grid grid-cols-2 p-1 bg-[#f0ede3] rounded-xl border border-[rgba(24,57,43,0.14)] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#18392b] text-white shadow-sm'
                  : 'text-[#546358] hover:text-[#18392b]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#18392b] text-white shadow-sm'
                  : 'text-[#546358] hover:text-[#18392b]'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div role="alert" className="mb-4 p-2.5 rounded-xl bg-[#b96d4b]/15 border border-[#b96d4b]/40 text-[#b96d4b] text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b96d4b] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-full-name" className="block text-xs text-[#18392b] font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#546358] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white border border-[rgba(24,57,43,0.18)] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#18392b] placeholder:text-[#546358]/60 focus:outline-none focus:border-[#18392b] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs text-[#18392b] font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#546358] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-[rgba(24,57,43,0.18)] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#18392b] placeholder:text-[#546358]/60 focus:outline-none focus:border-[#18392b] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs text-[#18392b] font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#546358] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                  className="w-full bg-white border border-[rgba(24,57,43,0.18)] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#18392b] placeholder:text-[#546358]/60 focus:outline-none focus:border-[#18392b] transition"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#18392b] hover:bg-[#11291f] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with Studio...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? `Create Account & ${authModalConfig?.actionLabel ?? 'Continue to Checkout'}`
                      : `Sign In & ${authModalConfig?.actionLabel ?? 'Continue to Checkout'}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Terms Footer */}
        <div className="mt-4 pt-3 border-t border-[rgba(24,57,43,0.14)] flex items-center justify-between text-[11px] text-[#546358]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#657a4e]" />
            <span>256-bit Encrypted Session</span>
          </span>
          <span>Phase 3 NextAuth Ready</span>
        </div>
      </div>
    </div>
  );
};
