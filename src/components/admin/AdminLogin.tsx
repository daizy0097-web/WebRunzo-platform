import React, { useState, useEffect } from 'react';
import {
  useApp,
  clearRecoveryUrlState,
  setStoredPasswordResetActive,
  checkIsRecoveryInUrl,
  isStoredPasswordResetActive,
} from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  Database,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  supabase,
  isSupabaseConfigured,
  getAppBaseUrl,
  getAuthErrorFromUrl,
} from '../../lib/supabase';

type AdminAuthView = 'login' | 'forgot' | 'reset';

export const AdminLogin: React.FC = () => {
  const {
    loginAsAdmin,
    setCurrentExperience,
    isPasswordResetMode,
    setIsPasswordResetMode,
  } = useApp();

  const [view, setView] = useState<AdminAuthView>(() => {
    return isPasswordResetMode ? 'reset' : 'login';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Sync reset mode with context
  useEffect(() => {
    if (isPasswordResetMode) {
      setView('reset');
    }
  }, [isPasswordResetMode]);

  // Check URL recovery params or errors
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const authError = getAuthErrorFromUrl();
    if (authError) {
      console.warn('Supabase auth redirect error in AdminLogin:', authError);
      setError(`Password reset notice: ${authError}. Please request a fresh reset link below.`);
      clearRecoveryUrlState();
      setStoredPasswordResetActive(false);
      setIsPasswordResetMode(false);
      setView('forgot');
      return;
    }

    const isRecovery = checkIsRecoveryInUrl() || (isPasswordResetMode && isStoredPasswordResetActive());
    if (isRecovery) {
      setIsPasswordResetMode(true);
      setView('reset');
    }
  }, [isPasswordResetMode, setIsPasswordResetMode]);

  // Cooldown timer for reset emails
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResetCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resetCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to authenticate.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide both your owner email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAsAdmin(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please configure environment variables.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter your registered owner email address.');
      return;
    }

    if (resetCooldown > 0) {
      setError(`Please wait ${resetCooldown} seconds before requesting another reset email.`);
      return;
    }

    setIsLoading(true);
    try {
      const appBaseUrl = getAppBaseUrl();
      const origin =
        appBaseUrl ||
        (typeof window !== 'undefined' &&
        window.location?.origin &&
        window.location.origin !== 'null' &&
        !window.location.origin.includes('aistudio.google.com')
          ? window.location.origin
          : '');

      const cleanOrigin = origin.replace(/\/+$/, '');
      const redirectTo = cleanOrigin ? `${cleanOrigin}/` : undefined;
      console.log('Sending admin password reset to:', normalizedEmail, 'with redirectTo:', redirectTo);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      );

      if (resetError) {
        const rawMsg = (resetError.message || '').toLowerCase();
        const isRateLimit =
          rawMsg.includes('rate limit') ||
          rawMsg.includes('security purposes') ||
          rawMsg.includes('too many requests') ||
          (resetError as any).status === 429 ||
          (resetError as any).code === 'over_email_send_rate_limit';

        if (isRateLimit) {
          setResetCooldown(60);
          setError(
            'A password reset link was recently sent. For security, please check your inbox and spam folder, or wait 60 seconds before requesting another email.'
          );
          return;
        }

        setError(resetError.message || 'Failed to send password reset email.');
        return;
      }

      setResetCooldown(60);
      setSuccess(
        `Password reset link dispatched! Please check your email inbox and spam folder for instructions to reset your owner password.`
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword) {
      setError('Please enter your new owner password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          session = { user: userData.user } as any;
        }
      }

      if (sessionError || !session) {
        setError('Your password reset link is invalid or has expired. Please request a new link.');
        setView('forgot');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update owner password.');
        return;
      }

      const userEmail = session.user?.email || email;
      setSuccess('Owner password updated successfully! Please sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      clearRecoveryUrlState();
      setStoredPasswordResetActive(false);
      setIsPasswordResetMode(false);

      setTimeout(async () => {
        await supabase.auth.signOut();
        setEmail(userEmail);
        setView('login');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while resetting your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Public Link */}
      <button
        onClick={() => setCurrentExperience('public')}
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Website</span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-emerald-600/30">
            W
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {view === 'reset'
              ? 'Reset Owner Password'
              : view === 'forgot'
              ? 'Recover Owner Access'
              : 'Webrunzo Owner Portal'}
          </h2>
          <p className="text-xs text-slate-400">
            {view === 'reset'
              ? 'Enter and confirm your new secure owner password.'
              : view === 'forgot'
              ? 'Enter your registered owner email to receive a recovery link.'
              : 'Private master administration access for Webrunzo operations.'}
          </p>
        </div>

        {/* Supabase Security Status Badge */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Auth Backend</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
            isSupabaseConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {isSupabaseConfigured ? 'Connected (RLS Enforced)' : 'Setup Required (.env)'}
          </span>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <div className="font-semibold">Supabase Environment Required</div>
              <div className="text-[11px] text-amber-200/80 leading-relaxed">
                Authentication requires valid <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
              </div>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* VIEW 1: SIGN IN */}
        {view === 'login' && (
          <form id="admin-login-form" name="admin_portal_login" onSubmit={handleLogin} className="space-y-4 pt-1" autoComplete="on">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Owner Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="admin-email-input"
                  name="admin_owner_username"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@webrunzo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setView('forgot');
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition cursor-pointer hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="admin-password-input"
                  name="admin_owner_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isSupabaseConfigured}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition border border-emerald-500/30 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Supabase Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* VIEW 2: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <form id="admin-forgot-form" onSubmit={handleForgotPassword} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Registered Owner Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="admin-forgot-email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@webrunzo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                We'll email you a secure one-time password recovery link.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isSupabaseConfigured || resetCooldown > 0}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition border border-emerald-500/30 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Recovery Link...</span>
                </>
              ) : resetCooldown > 0 ? (
                <span>Resend available in {resetCooldown}s</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                  <span>Send Password Reset Link</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setView('login');
                }}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Owner Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: SET NEW PASSWORD */}
        {view === 'reset' && (
          <form id="admin-reset-form" onSubmit={handleResetPassword} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="admin-new-password-input"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="admin-confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition border border-emerald-500/30 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Save New Owner Password</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  clearRecoveryUrlState();
                  setStoredPasswordResetActive(false);
                  setIsPasswordResetMode(false);
                  setView('login');
                }}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and Back to Login</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-[11px] text-slate-500">
          Supabase Row-Level Security • Role-Based Access Control
        </div>

      </div>
    </div>
  );
};
