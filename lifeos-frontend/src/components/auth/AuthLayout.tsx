import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-300">
      {/* Background Animated Gradient Mesh Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/15 via-rose-500/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 px-2 relative z-20">
        <Link to="/login" className="flex items-center space-x-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-orange-500 p-0.5 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#0b0e17] rounded-[14px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-purple-400 transition-colors">LifeOS</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400">v2.6 Pro</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">Engineering & Career Suite</p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center space-x-3 text-xs font-semibold text-slate-400">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">Systems Operational</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto my-auto py-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium py-2 px-2 relative z-20 border-t border-slate-800/40 gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
          <span>Local Encrypted Session • Privacy First Architecture</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span>LifeOS Engineering Workspace © 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
