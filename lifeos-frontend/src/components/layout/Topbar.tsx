import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Bell, Search, Compass, ChevronDown } from 'lucide-react';
import { QuickAddModal } from '../common/QuickAddModal';
import { CommandPalette } from '../common/CommandPalette';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';

export const Topbar = () => {
  const { user: dataUser } = useData();
  const { currentUser } = useAuth();
  const activeUser = currentUser || dataUser;
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const [unreadCount, setUnreadCount] = useState(4);

  // Global Keyboard Shortcut: ⌘Q / Ctrl+Q / Alt+Q or Q key when not typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElem = document.activeElement as HTMLElement | null;
      const isInput = activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable);

      if ((e.metaKey || e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      } else if (!isInput && e.key.toLowerCase() === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getQuickAddTab = (loc: any) => {
    const path = loc.pathname;
    const searchParams = new URLSearchParams(loc.search);
    const subTab = searchParams.get('tab');

    if (path === '/job-search') return 'job';
    if (path === '/trackers') {
      if (subTab === 'jobs' || subTab === 'job') return 'job';
      if (subTab === 'expenses' || subTab === 'expense') return 'expense';
      if (subTab === 'study') return 'study';
      return 'job'; // Default for trackers page
    }
    return 'task'; // Default for planner / overview / general
  };

  const getPageMeta = (pathname: string) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return { tag: 'Overview', title: 'Dashboard System', subtitle: 'Live stats, streak heatmap & DSA flashcard deck' };
      case '/trackers':
        return { tag: 'Analytics', title: 'Performance Trackers', subtitle: 'Study intensity, 6-column Job Kanban & Expenses' };
      case '/dsa':
        return { tag: 'Algorithms', title: 'DSA Revision Hub', subtitle: 'Pattern cards, Spaced repetition & code snippets' };
      case '/planner':
        return { tag: 'Execution', title: 'Planner & Routine', subtitle: 'Sprint Kanban task board & daily habit check-in' };
      case '/notes':
        return { tag: 'Knowledge Base', title: 'Code & DSA Notes', subtitle: 'Markdown notes with flashcard conversion' };
      case '/journal':
        return { tag: 'Reflection', title: 'Daily Journal Log', subtitle: 'Emoji mood tags, daily reflections & key wins' };
      case '/projects':
        return { tag: 'Builds', title: 'Projects Portfolio', subtitle: 'Milestone progress breakdown & linked tasks' };
      case '/job-search':
        return { tag: 'Career', title: 'Job Search Pipeline', subtitle: 'Tailored resume drafts & stale application alerts' };
      case '/settings':
        return { tag: 'Preferences', title: 'System Settings', subtitle: 'Profile options, target goals & 10 theme presets' };
      default:
        return { tag: 'LifeOS', title: 'Productivity Suite', subtitle: 'Personal Developer Operating System' };
    }
  };

  const { tag, title, subtitle } = getPageMeta(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 my-4 mr-4 ml-2 flex items-center justify-between px-6 py-3.5 rounded-3xl border border-theme-border bg-theme-surface/90 backdrop-blur-xl shadow-xl transition-all">
        {/* Page Title & Section Tag */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
            <Compass className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-theme-accent-light text-theme-accent text-[10px] font-extrabold uppercase tracking-wider">
                {tag}
              </span>
              <h1 className="text-base font-extrabold text-theme-main tracking-tight">{title}</h1>
            </div>
            <p className="text-[11px] text-theme-muted font-normal mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-3">
          {/* Global Cmd+K Search Launcher */}
          <button
            onClick={() => setIsCmdKOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-2xl border border-theme-border bg-theme-card text-theme-muted text-xs w-72 lg:w-96 hover:border-theme-accent transition shadow-inner cursor-pointer"
          >
            <Search className="h-4 w-4 text-theme-accent" />
            <span className="text-theme-muted font-medium flex-1 text-left">Search commands, tasks, notes...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-theme-card-hover text-[10px] text-theme-muted font-mono border border-theme-border">Ctrl+K</kbd>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-dual hover:opacity-90 text-white font-bold text-xs shadow-md shadow-theme-accent/20 transition active:scale-95 cursor-pointer"
            title="Quick Add (Ctrl+Q / Alt+Q)"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] text-white font-mono border border-white/30 ml-0.5">
              Ctrl+Q
            </kbd>
          </button>

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              ref={notificationButtonRef}
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                if (isProfileOpen) setIsProfileOpen(false);
              }}
              className={`relative p-2 rounded-2xl border transition cursor-pointer bg-theme-card ${
                isNotificationOpen
                  ? 'border-theme-accent text-theme-accent bg-theme-accent-light'
                  : 'border-theme-border text-theme-muted hover:bg-theme-card-hover'
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-theme-accent ring-2 ring-theme-surface animate-ping" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-theme-accent ring-2 ring-theme-surface" />
                </>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              setUnreadCount={setUnreadCount}
              triggerRef={notificationButtonRef}
            />
          </div>

          {/* Profile Right Corner Trigger */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                if (isNotificationOpen) setIsNotificationOpen(false);
              }}
              className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-theme-border bg-theme-card hover:bg-theme-card-hover transition cursor-pointer shadow-sm group"
              title="Profile & Quick Settings"
            >
              <div className="relative shrink-0">
                <img
                  src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
                  alt={activeUser?.name || "Profile Avatar"}
                  className="h-7 w-7 rounded-xl object-cover ring-2 ring-theme-accent/40 group-hover:ring-theme-accent transition"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-theme-surface" />
              </div>
              <div className="hidden xl:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-theme-main group-hover:text-theme-accent transition">{activeUser?.name || 'Alex Chen'}</span>
                <span className="text-[10px] text-theme-muted font-medium mt-0.5">{activeUser?.role?.split('&')[0] || 'Developer'}</span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-theme-muted group-hover:text-theme-main transition ${isProfileOpen ? 'rotate-180 text-theme-accent' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              triggerRef={profileButtonRef}
            />
          </div>
        </div>
      </header>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={getQuickAddTab(location)}
      />
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
    </>
  );
};

