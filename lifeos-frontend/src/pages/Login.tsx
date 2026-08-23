// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FieldError } from '../components/common/FieldError';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Briefcase,
  Flame,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  const { login, demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoSignIn = async () => {
    setFieldErrors({});
    setLoading(true);
    const res = await demoLogin();
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero & Feature Showcase */}
        <div className="lg:col-span-6 space-y-6 pr-0 lg:pr-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Built for Engineers & High Performers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Welcome Back to <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-orange-400 bg-clip-text text-transparent">
              Your Command Center
            </span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Access your unified workspace to manage DSA problem sets, track job applications, optimize daily habits, and reach your full engineering potential.
          </p>

          {/* Highlights List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">DSA & Revision System</h4>
                <p className="text-[11px] text-slate-400">SM-2 Spaced repetition flashcards & pattern tracking.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 transition">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Job Search Radar</h4>
                <p className="text-[11px] text-slate-400">Interactive Kanban application pipeline & resume manager.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-orange-500/40 transition">
              <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Habits & Study Sprints</h4>
                <p className="text-[11px] text-slate-400">Daily streak counter, Pomodoro focus timer & heatmaps.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Glass Sign-In Box */}
        <div className="lg:col-span-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-orange-500" />

            <div>
              <h2 className="text-2xl font-black text-white">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your account credentials to log in.</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="alex.chen@lifeos.dev"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs font-semibold text-white placeholder-slate-600 focus:outline-none transition ${
                      fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                    }`}
                  />
                </div>
                <FieldError error={fieldErrors.email} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border text-xs font-semibold text-white placeholder-slate-600 focus:outline-none transition ${
                      fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError error={fieldErrors.password} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-semibold">Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-extrabold">
                <span className="bg-slate-900 px-3 text-slate-500">Or Quick Start</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Continue as Demo Developer</span>
            </button>

            <p className="text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-extrabold text-purple-400 hover:text-purple-300 hover:underline transition">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
