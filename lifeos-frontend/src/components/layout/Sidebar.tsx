import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  FileText,
  BookOpen,
  CalendarDays,
  FolderGit2,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user: dataUser } = useData();
  const { currentUser } = useAuth();
  const activeUser = currentUser || dataUser;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Trackers', path: '/trackers', icon: BarChart3 },
    { label: 'DSA Revision', path: '/dsa', icon: BrainCircuit, badge: 'Hub' },
    { label: 'Planner & Tasks', path: '/planner', icon: CalendarDays },
    { label: 'Notes', path: '/notes', icon: FileText },
    { label: 'Journal', path: '/journal', icon: BookOpen },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Job Search', path: '/job-search', icon: Briefcase, badge: 'Active' },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside
      className={`relative my-4 ml-4 flex flex-col justify-between rounded-3xl border border-theme-border bg-theme-surface/90 backdrop-blur-xl shadow-2xl transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div>
        <div className={`flex border-b border-theme-border items-center ${collapsed ? 'justify-center p-4' : 'justify-between p-4'}`}>
          <div
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center space-x-3 overflow-hidden cursor-pointer group/logo"
            title={collapsed ? "Click logo to expand sidebar" : "Click logo to collapse sidebar"}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-dual text-white shadow-lg shadow-theme-accent/25 group-hover/logo:scale-105 transition-transform duration-200">
              <Zap className="h-5 w-5 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-xl tracking-tight text-gradient-dual group-hover/logo:opacity-90 transition-opacity">
                  LifeOS
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-theme-muted font-bold">
                  NextGen Productivity
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'} rounded-2xl font-semibold text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-dual text-white shadow-md shadow-theme-accent/20 scale-[1.02]'
                      : 'text-theme-muted hover:bg-theme-card-hover hover:text-theme-main'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-white/20 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Streak Summary & Profile */}
      <div className="p-3 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-theme-accent-light text-theme-accent">
                <Flame className="h-4 w-4 fill-theme-accent/20 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-theme-muted font-semibold uppercase tracking-wider">Streak</p>
                <p className="text-xs font-extrabold text-theme-main flex items-center gap-1">
                  <span>{activeUser?.streak ?? dataUser?.streak ?? 0} Days</span>
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20 inline" />
                </p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
        )}

        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'space-x-3 p-2'} rounded-2xl hover:bg-theme-card-hover transition cursor-pointer`}>
          <img
            src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
            alt={activeUser?.name || "User Avatar"}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-theme-accent/40 shadow-sm shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-theme-main truncate">{activeUser?.name || 'User'}</p>
              <p className="text-[10px] text-theme-muted truncate">{activeUser?.role?.split('&')[0] || 'Software Engineer'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
