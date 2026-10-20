import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalConfig, signIn, isLoading } = useAuth();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null);
      setFullName('');
      setEmail('');
      setPassword('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    const result = await signIn('google');
    if (!result.ok && result.error) {
      setErrorMsg(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = await signIn('credentials', {
      email,
      password,
      name: fullName,
      isSignUp: mode === 'signup',
    });

    if (!result.ok && result.error) {
      setErrorMsg(result.error);
    }
  };

  const handleFillDemo = (type: 'vicky' | 'andrew') => {
    if (type === 'vicky') {
      setEmail('vicky@verdantstudio.com');
      setPassword('password123');
      setMode('signin');
    } else {
      setEmail('andrew@terrascape.hardware');
      setPassword('password123');
      setMode('signin');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl shadow-emerald-950/40 p-5 sm:p-7 overflow-hidden text-stone-100 max-h-[92vh] flex flex-col">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                TerraScape Account Required
              </p>
              <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-stone-100">
                {authModalConfig?.title || 'Save Your Living World'}
              </h2>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
            title="Cancel and return to Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation Banner */}
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-5">
          {authModalConfig?.message ||
            'Every TerraScape is an individually serialized living ecosystem. An account is required so Andrew can attach your coordinate blueprint to your workshop build tray and live order tracker.'}
        </p>

        <div className="overflow-y-auto pr-1">
          {/* Google OAuth One-Click Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-750 text-stone-100 text-sm font-medium flex items-center justify-center gap-2.5 transition shadow-sm hover:border-stone-600 disabled:opacity-50 cursor-pointer"
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
              <div className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-stone-900 px-2.5 text-stone-400 uppercase tracking-wider text-[10px]">
                Or with email
              </span>
            </div>
          </div>

          {/* Tab Switcher: Create Account vs Sign In */}
          <div className="grid grid-cols-2 p-1 bg-stone-950/70 rounded-xl border border-stone-800 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vicky Adebona"
                    className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@verdantstudio.com"
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with Studio...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? 'Create Account & Continue to Checkout'
                      : 'Sign In & Continue to Checkout'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Links for smooth testing */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 flex flex-col gap-1.5">
            <div className="flex items-center gap-1 text-emerald-400/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Studio Testing Shortcuts:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-stone-300">
              <button
                type="button"
                onClick={() => handleFillDemo('vicky')}
                className="hover:underline text-emerald-300 cursor-pointer"
              >
                Sign in as Vicky Adebona (vicky@verdantstudio.com)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleFillDemo('andrew')}
                className="hover:underline text-emerald-300 cursor-pointer"
              >
                Sign in as Andrew Hung
              </button>
            </div>
          </div>
        </div>

        {/* Security & Terms Footer */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-bit Encrypted Session</span>
          </span>
          <span className="text-stone-400">Phase 3 NextAuth Ready</span>
        </div>
      </div>
    </div>
  );
};
