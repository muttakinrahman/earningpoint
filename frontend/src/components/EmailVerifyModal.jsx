import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, X, ArrowRight, RefreshCw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config';

// Step 1 — Enter Email
const EnterEmailStep = ({ onSend, loading, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }
    setError('');
    await onSend(email.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-300/30 dark:shadow-indigo-900/30 mb-6">
        <Mail className="w-9 h-9 text-white" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Verify Your Email</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed px-2">
        Enter your Gmail address. We'll send a 6-digit verification code to confirm it's you.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Mail className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="yourname@gmail.com"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            autoComplete="email"
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs font-medium px-1">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-300/30 dark:shadow-indigo-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending Code...</>
          ) : (
            <><ArrowRight className="w-4 h-4" /> Send Verification Code</>
          )}
        </button>
      </form>
    </motion.div>
  );
};

// Step 2 — Enter OTP
const EnterOTPStep = ({ email, onVerify, onResend, loading, resendLoading, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    await onVerify(code);
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(60);
    await onResend();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-300/30 dark:shadow-violet-900/30 mb-6">
        <ShieldCheck className="w-9 h-9 text-white" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Enter the Code</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1 px-2">
        We sent a 6-digit code to
      </p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4 text-center break-all">{email}</p>

      {/* Spam Folder Reminder Box */}
      <div className="w-full p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-left flex items-start gap-2.5 mb-5">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          <span className="font-bold">Can't find the email?</span> Please check your <span className="font-bold underline decoration-amber-500">Spam or Junk</span> folder. If found there, tap <span className="font-bold text-amber-800 dark:text-amber-100">"Report Not Spam"</span> or move it to your Inbox.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {/* OTP Boxes */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none focus:scale-105
                ${digit
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white'
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30`}
              style={{ height: '52px' }}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-medium text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-300/30 dark:shadow-violet-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Verify Email</>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-xs text-slate-400">Resend code in <span className="font-bold text-indigo-500">{timer}s</span></p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Resend Code
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

// Step 3 — Success
const SuccessStep = ({ email, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center py-4"
  >
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-300/30 dark:shadow-green-900/30 mb-6">
      <CheckCircle2 className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Email Verified!</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2 px-2">
      Your email address has been successfully verified.
    </p>
    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-8 break-all text-center">{email}</p>
    <button
      onClick={onClose}
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 active:scale-[0.98] transition-all shadow-lg"
    >
      <CheckCircle2 className="w-4 h-4" /> Done
    </button>
  </motion.div>
);

// Main Modal
const EmailVerifyModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const token = localStorage.getItem('token');

  const handleSendOTP = async (email) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE}/api/email-verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send code.');
      setTargetEmail(email);
      setStep('otp');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_BASE}/api/email-verify/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await handleSendOTP(targetEmail);
    setResendLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && step !== 'success' && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-7 relative"
        >
          {/* Close Button */}
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
              {apiError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <EnterEmailStep key="email" onSend={handleSendOTP} loading={loading} onClose={onClose} />
            )}
            {step === 'otp' && (
              <EnterOTPStep
                key="otp"
                email={targetEmail}
                onVerify={handleVerifyOTP}
                onResend={handleResend}
                loading={loading}
                resendLoading={resendLoading}
                onClose={onClose}
              />
            )}
            {step === 'success' && (
              <SuccessStep key="success" email={targetEmail} onClose={onClose} />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerifyModal;
