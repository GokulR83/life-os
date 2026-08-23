import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  // 1. Session Hydration Guard: Wait for initial token check to complete before deciding
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-4 max-w-sm w-full mx-4 relative z-10">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="h-7 w-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white tracking-wide">Validating Session</h3>
            <p className="text-xs text-slate-400">Authenticating token with LifeOS Cloud...</p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-bold text-slate-400">Connecting securely</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Guard: Redirect to /login saving target path for post-login return
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated Session: Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
