import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  RotateCw,
  ShieldAlert,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { API_BASE } from '../config';

const COUNTRY_CODES = [
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

const ForgotPasswordPage = ({ onBack }) => {
  // Steps: 'input' | 'otp' | 'reset' | 'success'
  const [step, setStep] = useState('input');
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Input
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 2: OTP
  const [userId, setUserId] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // Step 3: Change Password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // ── 1. Send OTP ─────────────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setError('');

    let identifier = '';
    if (authMethod === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      identifier = email.trim().toLowerCase();
    } else {
      if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
        setError('Please enter a valid mobile phone number.');
        return;
      }
      identifier = phoneNumber.trim();
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          countryCode
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setUserId(data.userId || '');
      setMaskedTarget(data.maskedTarget || identifier);
      setDeliveryType(data.type || authMethod);
      setOtpDigits(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── 2. OTP Input Handler ───────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError('');

    // Advance to next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (value && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setOtpDigits(arr);
      otpInputRefs.current[5]?.focus();
      handleVerifyCode(pasted);
    }
  };

  // ── 2.5 Verify OTP ─────────────────────────────────────────────────────────
  const handleVerifyCode = async (codeOverride) => {
    const code = codeOverride || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          identifier: authMethod === 'email' ? email.trim() : phoneNumber.trim(),
          code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      setResetToken(data.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // ── 3. Reset Password ──────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-8 px-3 sm:px-4 select-none">
      <div className="w-full max-w-[420px] sm:max-w-[450px] mx-auto flex flex-col px-6 sm:px-8 py-8 bg-white dark:bg-slate-900 sm:border border-slate-100 dark:border-slate-800 rounded-3xl sm:shadow-2xl transition-all">
        
        {/* Top Header Navigation */}
        <div className="pb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setError('');
              if (step === 'otp') setStep('input');
              else if (step === 'reset') setStep('otp');
              else onBack();
            }}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Step Indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-all ${step === 'input' ? 'w-6 bg-purple-600' : 'bg-purple-200 dark:bg-purple-900'}`} />
              <span className={`w-2 h-2 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-purple-600' : 'bg-purple-200 dark:bg-purple-900'}`} />
              <span className={`w-2 h-2 rounded-full transition-all ${step === 'reset' ? 'w-6 bg-purple-600' : 'bg-purple-200 dark:bg-purple-900'}`} />
            </div>
          )}
        </div>

        {/* ── STEP 1: Enter Email or Phone Number ─────────────────────────── */}
        {step === 'input' && (
          <div className="flex-1 flex flex-col pt-1">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Enter your registered email or mobile number to receive a 6-digit recovery code.
            </p>

            {/* Method Tabs: Email vs Phone */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMethod === 'phone'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile Number</span>
              </button>
            </div>

            <form onSubmit={handleSendCode} className="space-y-5">
              {authMethod === 'email' ? (
                /* Email Input */
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                    Email Account
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-purple-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your@email.com"
                      autoFocus
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors placeholder:text-slate-400"
                    />
                  </div>
                </div>
              ) : (
                /* Phone Input with Country Code */
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-28 py-4 px-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-bold outline-none focus:border-purple-600 dark:focus:border-purple-500 cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-purple-600">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setError('');
                        }}
                        placeholder="01XXXXXXXXX"
                        autoFocus
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Verify 6-Digit Code ─────────────────────────────────── */}
        {step === 'otp' && (
          <div className="flex-1 flex flex-col pt-1">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
              Enter 6-Digit Code
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
              We sent a verification code to <span className="font-bold text-purple-600 dark:text-purple-400">{maskedTarget}</span>.
            </p>

            {/* Spam Folder Notice for Email */}
            {(deliveryType === 'email' || authMethod === 'email' || maskedTarget?.includes('@')) && (
              <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-left flex items-start gap-2.5 mb-5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  <span className="font-bold">Can't find the email?</span> Please check your <span className="font-bold underline decoration-amber-500">Spam or Junk</span> folder. If found there, tap <span className="font-bold text-amber-800 dark:text-amber-100">"Report Not Spam"</span> or move it to your Inbox.
                </div>
              </div>
            )}

            {/* 6-digit OTP Input Boxes */}
            <div className="flex justify-between gap-1.5 sm:gap-2 mb-6" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-600 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-600/15 transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 mb-5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend Code Action */}
            <div className="flex items-center justify-between text-xs mb-6 px-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Didn't receive code?
              </span>
              {timer > 0 ? (
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  Resend in {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleVerifyCode()}
              disabled={loading || otpDigits.some((d) => !d)}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Proceed'
              )}
            </button>
          </div>
        )}

        {/* ── STEP 3: Change Password Page ────────────────────────────────── */}
        {step === 'reset' && (
          <div className="flex-1 flex flex-col pt-1">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
              Create New Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Your identity has been verified. Enter a new strong password for your account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-purple-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter new password (min 6 chars)"
                    required
                    autoFocus
                    className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-purple-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer mt-2"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 4: Success Screen ──────────────────────────────────────── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Password Changed!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Your password has been reset successfully. You can now log in to your Zenivio account with your new password.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] shadow-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
              }}
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
