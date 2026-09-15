import React, { useEffect, useState } from 'react';
import {
  useApp,
  clearRecoveryUrlState,
  setStoredPasswordResetActive,
  checkIsRecoveryInUrl,
  isStoredPasswordResetActive,
} from '../../context/AppContext';
import {
  Lock,
  Mail,
  ArrowRight,
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
} from '../../lib/supabase';

type AuthView =
  | 'login'
  | 'forgot'
  | 'reset';

export const ClientLogin: React.FC = () => {
  const {
    loginAsClient,
    setCurrentExperience,
    isPasswordResetMode,
    setIsPasswordResetMode,
  } = useApp();

  const [view, setView] = useState<AuthView>(() => {
    return isPasswordResetMode ? 'reset' : 'login';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [newPassword, setNewPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState('');
  const [success, setSuccess] =
    useState('');
  const [isLoading, setIsLoading] =
    useState(false);
  const [resetCooldown, setResetCooldown] =
    useState(0);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const interval = setInterval(() => {
      setResetCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resetCooldown]);

  useEffect(() => {
    if (isPasswordResetMode) {
      setView('reset');
    }
  }, [isPasswordResetMode]);

  /*
   * ---------------------------------------------------------
   * RECOVERY SESSION DETECTION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;

    const checkRecoverySession =
      async () => {
        try {
          const fullUrl =
            typeof window !== 'undefined'
              ? window.location.href.toLowerCase()
              : '';

          const hash =
            typeof window !== 'undefined'
              ? window.location.hash.toLowerCase()
              : '';

          const search =
            typeof window !== 'undefined'
              ? window.location.search.toLowerCase()
              : '';

          const isRecoveryUrl = checkIsRecoveryInUrl();
          const isRecoveryActive = isRecoveryUrl || (isPasswordResetMode && isStoredPasswordResetActive());

          // If URL already contains recovery tokens or reset mode is active, transition to 'reset' view
          if (isRecoveryActive && mounted) {
            console.log('Password recovery token detected in URL fragment/search/context.');
            setIsPasswordResetMode(true);
            setError('');
            setSuccess('');
            setView('reset');
            return;
          }

          const {
            data,
            error: sessionError,
          } =
            await supabase.auth.getSession();

          if (sessionError) {
            console.error(
              'Recovery session error:',
              sessionError
            );
            return;
          }

          if (
            mounted &&
            data.session &&
            isRecoveryActive
          ) {
            console.log(
              'Password recovery session detected.'
            );

            setIsPasswordResetMode(true);
            setError('');
            setSuccess('');
            setView('reset');
          }
        } catch (err) {
          console.error(
            'Could not check password recovery session:',
            err
          );
        }
      };

    checkRecoverySession();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) return;

          console.log(
            'Supabase auth event:',
            event
          );

          const hash =
            typeof window !== 'undefined'
              ? window.location.hash.toLowerCase()
              : '';
          const search =
            typeof window !== 'undefined'
              ? window.location.search.toLowerCase()
              : '';

          const isRecovery =
            event === 'PASSWORD_RECOVERY' ||
            (session &&
              (hash.includes('type=recovery') || search.includes('type=recovery')));

          if (isRecovery) {
            console.log('Activating password reset form from auth event:', event);
            setIsPasswordResetMode(true);
            setError('');
            setSuccess('');
            setView('reset');
          } else if (event === 'SIGNED_IN' && !hash.includes('type=recovery')) {
            clearRecoveryUrlState();
            setStoredPasswordResetActive(false);
            setIsPasswordResetMode(false);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isPasswordResetMode, setIsPasswordResetMode]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const goToLogin = () => {
    clearMessages();
    clearRecoveryUrlState();
    setStoredPasswordResetActive(false);
    setIsPasswordResetMode(false);

    setPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setView('login');
  };

  const goToForgotPassword = () => {
    clearMessages();
    clearRecoveryUrlState();
    setStoredPasswordResetActive(false);
    setIsPasswordResetMode(false);

    setPassword('');
    setShowPassword(false);

    setView('forgot');
  };

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */
  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    clearMessages();
    clearRecoveryUrlState();
    setStoredPasswordResetActive(false);
    setIsPasswordResetMode(false);

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
      return;
    }

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        'Please provide your client email and password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('[AUTH_DIAGNOSTIC] ClientLogin: handleLogin calling loginAsClient');
      const result =
        await loginAsClient(
          email.trim(),
          password
        );

      console.log('[AUTH_DIAGNOSTIC] ClientLogin: loginAsClient returned:', {
        success: result.success,
        error: result.error,
      });

      if (!result.success) {
        setError(
          result.error ||
            'Authentication failed. Please verify your credentials.'
        );
      }
    } catch (err: any) {
      console.error(
        '[AUTH_DIAGNOSTIC] ClientLogin: caught error:',
        err
      );

      setError(
        err?.message ||
          'An unexpected error occurred during client login.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FORGOT PASSWORD
   * ---------------------------------------------------------
   */
  const handleForgotPassword =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();
      clearMessages();

      if (!isSupabaseConfigured) {
        setError(
          'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
        );
        return;
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        setError(
          'Please enter your email address.'
        );
        return;
      }

      /*
       * Basic email validation.
       */
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          normalizedEmail
        )
      ) {
        setError(
          'Please enter a valid email address.'
        );
        return;
      }

      // Check if cooldown is currently active in component state
      if (resetCooldown > 0) {
        setError(
          `A reset request was recently submitted. Please check your inbox or wait ${resetCooldown} second${resetCooldown !== 1 ? 's' : ''} before requesting another link.`
        );
        return;
      }

      // Check sessionStorage for recent reset requests to this specific email address
      const storageKey = `webrunzo_last_reset_${normalizedEmail}`;
      try {
        const lastSentStr = sessionStorage.getItem(storageKey);
        if (lastSentStr) {
          const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSentStr, 10)) / 1000);
          if (elapsedSeconds < 60) {
            const remaining = 60 - elapsedSeconds;
            setResetCooldown(remaining);
            setError(
              `A password reset link was already requested recently. Please check your inbox and spam folder, or wait ${remaining} second${remaining !== 1 ? 's' : ''} before requesting another link.`
            );
            return;
          }
        }
      } catch {
        // Ignore sessionStorage access restrictions if private browsing
      }

      setIsLoading(true);

      try {
        /*
         * Optional pre-check: verify if the account exists via check_account_exists RPC
         * or known database tables if available.
         */
        let accountCheckResolved = false;
        let accountFound = false;

        try {
          const { data: existsResult, error: rpcError } = await supabase.rpc(
            'check_account_exists',
            { email_input: normalizedEmail }
          );

          if (!rpcError && typeof existsResult === 'boolean') {
            accountCheckResolved = true;
            accountFound = existsResult;
          }
        } catch (rpcErr) {
          console.debug('RPC check_account_exists check skipped:', rpcErr);
        }

        // If the database verified that this email does not exist anywhere in auth/profiles/customers:
        if (accountCheckResolved && !accountFound) {
          setError('This email is not associated with a WebRunzo account.');
          return;
        }

        /*
         * Dynamic App Origin Resolution:
         * Uses the real Cloud Run host or running browser origin dynamically,
         * avoiding localhost connection failures on client machines.
         */
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
        const redirectTo = cleanOrigin ? `${cleanOrigin}/#/client` : undefined;
        console.log('Sending Supabase password reset with redirectTo:', redirectTo);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo,
          }
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
            // Expected email rate limit / throttling - do NOT log with console.error
            console.warn('Password reset throttled by auth provider:', resetError.message);
            setResetCooldown(60);
            try {
              sessionStorage.setItem(storageKey, Date.now().toString());
            } catch {
              // Ignore
            }
            setError(
              'A password reset link was recently sent to this email address. For security and to protect against abuse, please check your inbox and spam folder, or wait 60 seconds before requesting another email.'
            );
            return;
          }

          if (
            rawMsg.includes('user not found') ||
            rawMsg.includes('email not found') ||
            (resetError as any).status === 404
          ) {
            setError('This email is not associated with a WebRunzo account.');
          } else {
            console.warn('Password reset request error:', resetError.message || resetError);
            setError(
              resetError.message ||
                'Unable to send password reset email. Please try again later.'
            );
          }
          return;
        }

        // Successful password reset email dispatched
        try {
          sessionStorage.setItem(storageKey, Date.now().toString());
        } catch {
          // Ignore
        }
        setResetCooldown(60);

        setSuccess(
          'Password reset link has been sent to your email. Please check your inbox and spam folder.'
        );
      } catch (err: any) {
        const rawMsg = (err?.message || '').toLowerCase();
        if (
          rawMsg.includes('rate limit') ||
          rawMsg.includes('security purposes') ||
          rawMsg.includes('too many requests')
        ) {
          console.warn('Password reset request rate-limited:', err?.message);
          setResetCooldown(60);
          setError(
            'A password reset link was recently sent to this email address. Please check your inbox and spam folder, or wait 60 seconds before requesting another email.'
          );
        } else {
          console.warn('Password reset unexpected error:', err?.message || err);
          setError(
            err?.message ||
              'Unable to process password reset request. Please try again.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * RESET PASSWORD
   * ---------------------------------------------------------
   */
  const handleResetPassword =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();
      clearMessages();

      if (!isSupabaseConfigured) {
        setError(
          'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
        );
        return;
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        setError(
          'Please enter and confirm your new password.'
        );
        return;
      }

      if (newPassword.length < 6) {
        setError(
          'Your new password must be at least 6 characters long.'
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          'The passwords do not match.'
        );
        return;
      }

      setIsLoading(true);

      try {
        /*
         * Make sure the recovery link actually created
         * a Supabase session.
         */
        const {
          data: {
            session,
          },
          error:
            sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.warn(
            'Recovery session notice:',
            sessionError.message || sessionError
          );

          setError(
            'Your password reset session could not be verified. Please request a new reset link.'
          );

          return;
        }

        if (!session) {
          setError(
            'Your password reset link is invalid or has expired. Please request a new reset link.'
          );

          return;
        }

        console.log(
          'Recovery session confirmed for:',
          session.user.email
        );

        /*
         * Update password.
         */
        const {
          error:
            updateError,
        } =
          await supabase.auth.updateUser(
            {
              password:
                newPassword,
            }
          );

        if (updateError) {
          console.warn(
            'Password update notice:',
            updateError.message || updateError
          );

          setError(
            updateError.message
          );

          return;
        }

        console.log(
          'Password successfully updated.'
        );

        setSuccess(
          'Password updated successfully! Redirecting to login...'
        );

        setNewPassword('');
        setConfirmPassword('');

        setShowNewPassword(false);
        setShowConfirmPassword(false);

        /*
         * Clean URL hash so refreshing does not re-trigger recovery mode
         */
        clearRecoveryUrlState();
        setStoredPasswordResetActive(false);
        setIsPasswordResetMode(false);

        /*
         * End temporary recovery session and transition to login.
         */
        setTimeout(
          async () => {
            await supabase.auth.signOut();
            clearRecoveryUrlState();
            setStoredPasswordResetActive(false);
            setIsPasswordResetMode(false);

            setView('login');
            setSuccess(
              'Password reset successfully. You can now log in with your new password.'
            );
          },
          1800
        );
      } catch (err: any) {
        console.warn(
          'Unexpected password update issue:',
          err?.message || err
        );

        setError(
          err?.message ||
            'Unable to update your password. Please request a new reset link.'
        );
      } finally {
        setIsLoading(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * PASSWORD TOGGLE
   * ---------------------------------------------------------
   */
  const PasswordToggle = ({
    visible,
    onToggle,
    label,
  }: {
    visible: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
      aria-label={
        visible
          ? `Hide ${label}`
          : `Show ${label}`
      }
      title={
        visible
          ? `Hide ${label}`
          : `Show ${label}`
      }
    >
      {visible ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );

  /*
   * ---------------------------------------------------------
   * HEADER
   * ---------------------------------------------------------
   */
  const renderHeader = () => {
    if (view === 'forgot') {
      return (
        <>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <KeyRound className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Reset Your Password
          </h2>

          <p className="text-xs text-slate-400">
            Enter your client account email and we'll send you a secure reset
            link.
          </p>
        </>
      );
    }

    if (view === 'reset') {
      return (
        <>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <KeyRound className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Reset Your Password
          </h2>

          <p className="text-xs text-slate-400">
            Choose a new secure password for your WebRunzo client account.
          </p>
        </>
      );
    }

    return (
      <>
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-600/30">
          W
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Client Portal Access
        </h2>

        <p className="text-xs text-slate-400">
          Access your website controls, live preview, invoices, and support.
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Public Website */}
      <button
        onClick={() => {
          clearRecoveryUrlState();
          setStoredPasswordResetActive(false);
          setIsPasswordResetMode(false);
          setCurrentExperience('public');
        }}
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />

        <span>
          Back to Public Website
        </span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          {renderHeader()}
        </div>

        {/* Supabase Status */}
        {view === 'login' && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px]">

            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4 text-indigo-400" />

              <span>
                Supabase Auth Protected
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isSupabaseConfigured
                ? 'Connected (RLS Active)'
                : 'Setup Required (.env)'}
            </span>
          </div>
        )}

        {/* Environment Warning */}
        {!isSupabaseConfigured &&
          view === 'login' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">

              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />

              <div className="space-y-1">
                <div className="font-semibold">
                  Supabase Environment Required
                </div>

                <div className="text-[11px] text-amber-200/80 leading-relaxed">
                  Client authentication requires connected Supabase credentials
                  in{' '}
                  <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded">
                    .env
                  </code>
                  .
                </div>
              </div>
            </div>
          )}

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">

            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">

            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* =====================================================
            LOGIN
        ===================================================== */}
        {view === 'login' && (
          <form
            id="client-login-form"
            name="client_portal_login"
            onSubmit={handleLogin}
            className="space-y-4 pt-1"
            autoComplete="on"
          >

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Client Email
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />

                <input
                  id="client-email-input"
                  name="client_portal_user_email"
                  type="email"
                  autoComplete="username"
                  placeholder="client@yourbusiness.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>

              <div className="flex items-center justify-between mb-1.5">

                <label className="block text-[11px] font-semibold text-slate-300">
                  Password
                </label>

                <button
                  type="button"
                  onClick={
                    goToForgotPassword
                  }
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">

                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />

                <input
                  id="client-password-input"
                  name="client_portal_user_password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-11 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />

                <PasswordToggle
                  visible={
                    showPassword
                  }
                  onToggle={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  label="password"
                />
              </div>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !isSupabaseConfigured
              }
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Verifying Client Account...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Sign In to Client Portal
                  </span>

                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Client Account Provisioning Notice */}
            <div className="pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Client accounts are created after WebRunzo approves your enquiry. If you are already a WebRunzo client, sign in with your client credentials or contact support.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* =====================================================
            FORGOT PASSWORD
        ===================================================== */}
        {view === 'forgot' && (
          <form
            id="client-forgot-password-form"
            name="client_portal_forgot_password"
            onSubmit={
              handleForgotPassword
            }
            className="space-y-4 pt-1"
            autoComplete="on"
          >

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Client Email
              </label>

              <div className="relative">

                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />

                <input
                  id="client-forgot-email-input"
                  name="client_forgot_email"
                  type="email"
                  autoComplete="username"
                  placeholder="client@yourbusiness.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  disabled={isLoading}
                  autoFocus
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !isSupabaseConfigured ||
                resetCooldown > 0
              }
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Checking Account...
                  </span>
                </>
              ) : resetCooldown > 0 ? (
                <span>
                  Resend Available in {resetCooldown}s
                </span>
              ) : (
                <>
                  <span>
                    Send Reset Link
                  </span>

                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {resetCooldown > 0 && (
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-slate-400 leading-relaxed text-center">
                A reset link has been dispatched. Please check your inbox and spam folder.
              </div>
            )}

            <button
              type="button"
              onClick={
                goToLogin
              }
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />

              Back to Client Login
            </button>
          </form>
        )}

        {/* =====================================================
            RESET PASSWORD
        ===================================================== */}
        {view === 'reset' && (
          <form
            id="client-reset-password-form"
            name="client_portal_reset_password"
            onSubmit={
              handleResetPassword
            }
            className="space-y-4 pt-1"
            autoComplete="on"
          >

            {/* New Password */}
            <div>

              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                New Password
              </label>

              <div className="relative">

                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />

                <input
                  id="client-reset-new-password"
                  name="client_new_password"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  required
                  minLength={6}
                  disabled={isLoading}
                  autoFocus
                  className="w-full text-xs pl-10 pr-11 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />

                <PasswordToggle
                  visible={
                    showNewPassword
                  }
                  onToggle={() =>
                    setShowNewPassword(
                      (prev) => !prev
                    )
                  }
                  label="new password"
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1.5">
                Use at least 6 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>

              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>

              <div className="relative">

                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />

                <input
                  id="client-reset-confirm-password"
                  name="client_confirm_new_password"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full text-xs pl-10 pr-11 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
                />

                <PasswordToggle
                  visible={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  label="confirm password"
                />
              </div>
            </div>

            {/* Update Password */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !isSupabaseConfigured
              }
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Updating Password...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Update Password
                  </span>

                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500 leading-relaxed">
              After updating your password, you'll be returned to the client
              login screen.
            </p>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={goToLogin}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Back to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500">
          Encrypted Authentication • Tenant Isolated Data Access
        </div>
      </div>
    </div>
  );
};