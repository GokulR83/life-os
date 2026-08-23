// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FieldError } from '../components/common/FieldError';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  Rocket,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SignUp = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Software Engineer & CS Student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    }
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) {
      errors.name = 'Please enter your full name.';
    }
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const res = await register({ name, email, password, profession: role, role: "USER" });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Onboarding Banner */}
        <div className="lg:col-span-5 space-y-6 pr-0 lg:pr-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Rocket className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Workspace Setup</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Build Your Personal <br />
            <span className="bg-gradient-to-r from-emerald-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Growth Engine
            </span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Create an account to unlock all modules: DSA patterns, interactive flashcards, job application tracker, habit streaks, and technical notebook.
          </p>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <h4 className="text-xs font-extrabold text-white flex items-center space-x-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>What you get out-of-the-box:</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Pre-populated seed datasets for quick testing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>SM-2 Spaced repetition algorithm engine</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Kanban Pipeline & JSON backup data portability</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Glass Sign-Up Box */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

            <div>
              <h2 className="text-2xl font-black text-white">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">Get started with your developer productivity suite.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Alex Chen"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs font-semibold text-white placeholder-slate-600 focus:outline-none transition ${
                      fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                <FieldError error={fieldErrors.name} />
              </div>

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
                      fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                <FieldError error={fieldErrors.email} />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="At least 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border text-xs font-semibold text-white placeholder-slate-600 focus:outline-none transition ${
                      fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
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

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>Password Strength:</span>
                      <span className="capitalize">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Primary Role / Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Software Engineer & CS Student"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
