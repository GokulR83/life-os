import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Settings,
  Calendar,
  Briefcase,
  Moon,
  LogOut,
  Sparkles,
  ChevronRight,
  Flame,
  Check,
  Shield,
  Zap,
  Coffee,
  BookOpen,
  Activity
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const ProfileDropdown = ({ isOpen, onClose, triggerRef = null }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentTheme, setTheme, themesList } = useTheme();
  const { user: dataUser } = useData();
  const { logout, currentUser, updateProfile } = useAuth();
  const activeUser = currentUser || dataUser;

  const [activeStatus, setActiveStatus] = useState(activeUser?.workingStatus || 'Active Coding');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const statusOptions = [
    { label: 'Active Coding', icon: Activity },
    { label: 'Deep Focus', icon: Zap },
    { label: 'On Break', icon: Coffee },
    { label: 'Reviewing DSA', icon: BookOpen }
  ];

  useEffect(() => {
    if (activeUser?.workingStatus) {
      setActiveStatus(activeUser.workingStatus);
    }
  }, [activeUser?.workingStatus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(e.target))
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleSelectStatus = async (statusLabel) => {
    setActiveStatus(statusLabel);
    setNotificationMsg(`Status updated to: ${statusLabel}`);
    if (typeof updateProfile === 'function') {
      try {
        await updateProfile({ workingStatus: statusLabel });
      } catch (err) {
        console.warn('[STATUS UPDATE] Persist failed:', err?.message);
      }
    }
    setTimeout(() => setNotificationMsg(''), 2500);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-3xl border border-theme-border bg-theme-card/95 backdrop-blur-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {/* Header Profile Info */}
      <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-theme-surface border border-theme-border">
        <div className="relative shrink-0">
          <img
            src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
            alt={activeUser?.name || "User Avatar"}
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-theme-accent/50 shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-theme-surface" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-theme-main truncate">{activeUser?.name || 'Alex Chen'}</h3>
            <Badge variant="orange" size="sm" className="shrink-0 flex items-center gap-1">
              <span>{activeUser?.streak ?? dataUser?.streak ?? 1}d Streak</span>
              <Flame className="h-3 w-3 text-amber-500 inline" />
            </Badge>
          </div>
          <p className="text-[11px] text-theme-muted truncate">{activeUser?.email || 'alex.chen@lifeos.dev'}</p>
          <p className="text-[10px] font-semibold text-theme-accent truncate mt-0.5">{activeUser?.role || 'Software Engineer'}</p>
        </div>
      </div>

      {notificationMsg && (
        <div className="px-3 py-1.5 rounded-xl bg-theme-accent-light border border-theme-accent text-theme-accent text-xs font-semibold flex items-center justify-between">
          <span>{notificationMsg}</span>
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Live Status Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-muted px-1">Set Working Status</span>
        <div className="grid grid-cols-2 gap-1.5">
          {statusOptions.map((st) => {
            const IconComp = st.icon;
            const isSelected = activeStatus === st.label;
            return (
              <button
                key={st.label}
                onClick={() => handleSelectStatus(st.label)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
                  isSelected
                    ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                    : 'bg-theme-surface border-theme-border text-theme-muted hover:text-theme-main hover:border-theme-border/80'
                }`}
              >
                <IconComp className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-theme-accent'}`} />
                <span className="truncate">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions List */}
      <div className="space-y-1 pt-1 border-t border-theme-border">
        <button
          onClick={() => handleNavigate('/settings')}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-theme-main hover:bg-theme-card-hover transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Settings className="h-4 w-4 text-theme-accent" />
            <span>Profile & Account Settings</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-theme-muted group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => handleNavigate('/planner')}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-theme-main hover:bg-theme-card-hover transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Calendar className="h-4 w-4 text-theme-accent" />
            <span>Sprint & Task Planner</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-theme-muted group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => handleNavigate('/job-search')}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-theme-main hover:bg-theme-card-hover transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Briefcase className="h-4 w-4 text-theme-accent" />
            <span>Career & Job Applications</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-theme-muted group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Quick Theme Selector Dropdown */}
      <div className="pt-2 border-t border-theme-border space-y-2">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-theme-main bg-theme-surface border border-theme-border hover:border-theme-accent transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Moon className="h-4 w-4 text-theme-accent" />
            <span>Theme: <span className="text-theme-accent">{currentTheme.name}</span></span>
          </div>
          <ChevronRight className={`h-3.5 w-3.5 text-theme-muted transition-transform ${showThemePicker ? 'rotate-90' : ''}`} />
        </button>

        {showThemePicker && (
          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-theme-surface border border-theme-border max-h-48 overflow-y-auto">
            {themesList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-2 text-left transition cursor-pointer border ${
                  currentTheme.id === t.id
                    ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                    : 'bg-theme-card border-theme-border text-theme-muted hover:text-theme-main'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: t.color }}
                />
                <span className="truncate">{t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sign Out Row */}
      <div className="pt-1 border-t border-theme-border">
        <button
          onClick={() => {
            logout();
            navigate('/login');
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of LifeOS</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
