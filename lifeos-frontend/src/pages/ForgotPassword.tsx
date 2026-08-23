import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState(1); // 1: request, 2: sent verification
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleRequestReset = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setStep(2);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-500" />

          {/* Header Icon */}
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-orange-500/20 to-purple-500/20 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400 shadow-lg shadow-orange-500/10">
              <KeyRound className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Reset Your Password</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {step === 1
                ? 'Enter your registered email address to receive password recovery instructions.'
                : `We sent a security code and instructions to ${email}.`}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && step === 1 && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start space-x-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.chen@lifeos.dev"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Simulation Code */}
          {step === 2 && (
            <div className="space-y-5 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Instructions sent! Demo code pre-filled below for testing.</span>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Verification Code (6-Digits)
                </label>
                <div className="flex items-center justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`code-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={code[idx] || (idx === 0 ? '7' : idx === 1 ? '4' : idx === 2 ? '9' : idx === 3 ? '2' : idx === 4 ? '1' : '8')}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-base font-black rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  ))}
                </div>
              </div>

              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Verify & Sign In</span>
              </Link>

              <button
                type="button"
                onClick={() => { setStep(1); setSuccessMsg(''); }}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Resend email to a different address</span>
              </button>
            </div>
          )}

          {/* Return to Sign In Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-400 hover:text-white inline-flex items-center space-x-1.5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
