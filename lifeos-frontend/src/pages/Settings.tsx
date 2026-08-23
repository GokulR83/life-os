// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useTheme, themesList } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { FieldError } from '../components/common/FieldError';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Target,
  Palette,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Flame,
  LogOut,
  Lock,
  KeyRound,
  Save,
  AtSign
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Settings = () => {
  const { user: dataUser, setUser, exportDataApi, importDataApi, resetDataApi, ...fullState } = useData();
  const { theme, setTheme } = useTheme();
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const user = currentUser || dataUser || {};

  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || user.email?.split('@')[0] || '');
  const [email] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80');
  const [dailyDSAGoal, setDailyDSAGoal] = useState(user.dailyDSAGoal || 3);
  const [dailyStudyGoalHours, setDailyStudyGoalHours] = useState(user.dailyStudyGoalHours || 4);

  const [reminders, setReminders] = useState(user.notifications?.dailyReminder ?? true);
  const [streakWarnings, setStreakWarnings] = useState(user.notifications?.streakWarning ?? true);
  const [jobFollowUps, setJobFollowUps] = useState(user.notifications?.jobFollowUps ?? true);

  // Password Update Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; username?: string; dailyDSAGoal?: string; dailyStudyGoalHours?: string; currentPassword?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.username) setUsername(user.username);
      if (user.avatar) setAvatar(user.avatar);
      if (user.dailyDSAGoal) setDailyDSAGoal(user.dailyDSAGoal);
      if (user.dailyStudyGoalHours) setDailyStudyGoalHours(user.dailyStudyGoalHours);
    }
  }, [currentUser]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFieldErrors({});

    const errors: any = {};
    if (!name.trim()) {
      errors.name = 'Full name cannot be empty.';
    }
    if (!username.trim()) {
      errors.username = 'Username cannot be empty.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
      errors.username = 'Username can only contain letters, numbers, underscores, dots, and hyphens.';
    }

    if (dailyDSAGoal !== '' && (isNaN(Number(dailyDSAGoal)) || Number(dailyDSAGoal) < 1)) {
      errors.dailyDSAGoal = 'Target must be at least 1 problem.';
    }
    if (dailyStudyGoalHours !== '' && (isNaN(Number(dailyStudyGoalHours)) || Number(dailyStudyGoalHours) < 0.5)) {
      errors.dailyStudyGoalHours = 'Target hours must be at least 0.5 hours.';
    }

    if (newPassword && !currentPassword) {
      errors.currentPassword = 'Current password is required to set a new password.';
    }
    if (newPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'New password and confirmation password do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name,
        username: username.trim().toLowerCase(),
        avatar,
        theme,
        dailyDSAGoal: parseInt(dailyDSAGoal) || 3,
        dailyStudyGoalHours: parseFloat(dailyStudyGoalHours) || 4,
        notifications: {
          dailyReminder: reminders,
          streakWarning: streakWarnings,
          jobFollowUps: jobFollowUps
        }
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSaving(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      let exportData: any;
      try {
        exportData = await userService.exportData();
      } catch (e) {
        exportData = {
          user,
          tasks: fullState.tasks,
          studySessions: fullState.studySessions,
          jobApplications: fullState.jobApplications,
          expenses: fullState.expenses,
          dsaPatterns: fullState.dsaPatterns,
          flashcards: fullState.flashcards,
          notes: fullState.notes,
          journalEntries: fullState.journalEntries,
          projects: fullState.projects,
          heatmap: fullState.heatmap,
          resumeVersions: fullState.resumeVersions,
          exportDate: new Date().toISOString()
        };
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `LifeOS_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      // error handled via toast
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event: any) => {
        try {
          const parsed = JSON.parse(event.target.result);
          try {
            await userService.importData(parsed);
          } catch (apiErr) {
            if (importDataApi) importDataApi(parsed);
          }
        } catch (err: any) {
          // error handled via toast
        }
      };
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all user datasets back to a clean state?")) {
      try {
        try {
          await userService.resetData();
        } catch (apiErr) {
          if (resetDataApi) resetDataApi();
        }
      } catch (err: any) {
        // error handled via toast
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* Sticky Page Title Header */}
      <div className="sticky top-0 z-10 py-3.5 px-5 bg-theme-bg/95 backdrop-blur-xl border border-theme-border rounded-2xl shadow-xl flex items-center justify-between transition-all">
        <div>
          <h2 className="text-lg font-extrabold text-theme-main tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-theme-accent" />
            <span>Settings & Account Preferences</span>
          </h2>
          <p className="text-xs text-theme-muted">Manage profile details, daily goals, security, themes, and cloud data portability</p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveProfile()}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer disabled:opacity-50 flex items-center space-x-2 shrink-0"
        >
          {saving ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Settings & Preferences</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* User Profile Card */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-theme-border">
            <User className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Developer Profile Card</h3>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src={avatar || user.avatar}
              alt={name || user.name}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-theme-accent/30"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-theme-main">{name || user.name}</h4>
                {username && <span className="text-xs text-theme-accent font-semibold">@{username}</span>}
              </div>
              <p className="text-xs text-theme-muted">{user.title || user.role || 'Software Engineer'}</p>
              <div className="flex items-center space-x-2 pt-0.5">
                <Badge variant="orange" size="sm" className="flex items-center gap-1">
                  <span>{user.streak || 1} Day Streak</span>
                  <Flame className="h-3 w-3 text-amber-500 fill-amber-500/20" />
                </Badge>
                <span className="text-[10px] text-theme-muted">Account Role: {user.role || 'USER'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                  fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                }`}
                placeholder="Gokul Raju"
              />
              <FieldError error={fieldErrors.name} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-theme-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                    fieldErrors.username ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                  }`}
                  placeholder="gokul_raju"
                />
              </div>
              <FieldError error={fieldErrors.username} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-theme-muted">Email Address</label>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Read-Only
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-slate-900/60 text-xs text-slate-400 outline-none font-semibold cursor-not-allowed select-none opacity-80"
                  placeholder="rajugokul003@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold truncate"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
        </div>

        {/* Daily Goals & Focus */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-theme-border">
            <Target className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Daily Focus Goals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Daily DSA Target Problems</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyDSAGoal}
                onChange={(e) => {
                  setDailyDSAGoal(e.target.value);
                  if (fieldErrors.dailyDSAGoal) setFieldErrors(prev => ({ ...prev, dailyDSAGoal: undefined }));
                }}
                className={`w-full px-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                  fieldErrors.dailyDSAGoal ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                }`}
              />
              <FieldError error={fieldErrors.dailyDSAGoal} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Daily Study Target Hours</label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={dailyStudyGoalHours}
                onChange={(e) => {
                  setDailyStudyGoalHours(e.target.value);
                  if (fieldErrors.dailyStudyGoalHours) setFieldErrors(prev => ({ ...prev, dailyStudyGoalHours: undefined }));
                }}
                className={`w-full px-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                  fieldErrors.dailyStudyGoalHours ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                }`}
              />
              <FieldError error={fieldErrors.dailyStudyGoalHours} />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-theme-border">
            <Bell className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-theme-surface cursor-pointer">
              <div>
                <h4 className="text-xs font-bold text-theme-main">Daily Focus Reminder</h4>
                <p className="text-[10px] text-theme-muted">Get daily notifications for unresolved tasks and DSA study goals</p>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-theme-surface cursor-pointer">
              <div>
                <h4 className="text-xs font-bold text-theme-main">Streak Risk Warnings</h4>
                <p className="text-[10px] text-theme-muted">Receive alerts before your habit streak expires at midnight</p>
              </div>
              <input
                type="checkbox"
                checked={streakWarnings}
                onChange={(e) => setStreakWarnings(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-theme-surface cursor-pointer">
              <div>
                <h4 className="text-xs font-bold text-theme-main">Job Follow-Up Radar</h4>
                <p className="text-[10px] text-theme-muted">Alerts for job applications stale for more than 7 days</p>
              </div>
              <input
                type="checkbox"
                checked={jobFollowUps}
                onChange={(e) => setJobFollowUps(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Security & Password Update */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-theme-border">
            <KeyRound className="h-5 w-5 text-theme-accent" />
            <div>
              <h3 className="text-base font-bold text-theme-main">Security & Password Management</h3>
              <p className="text-xs text-theme-muted">Update your account access credentials securely</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (fieldErrors.currentPassword) setFieldErrors(prev => ({ ...prev, currentPassword: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                  fieldErrors.currentPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                }`}
              />
              <FieldError error={fieldErrors.currentPassword} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Confirm password"
                className={`w-full px-3.5 py-2 rounded-xl border bg-theme-surface text-xs text-theme-main outline-none font-semibold transition ${
                  fieldErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-theme-border focus:border-theme-accent'
                }`}
              />
              <FieldError error={fieldErrors.confirmPassword} />
            </div>
          </div>
        </div>

        {/* Interface Theme Selection */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-theme-border">
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-theme-accent" />
              <div>
                <h3 className="text-base font-bold text-theme-main">Interface Theme Mode</h3>
                <p className="text-xs text-theme-muted">Selecting a theme automatically saves it to your cloud backend profile</p>
              </div>
            </div>
            <Badge variant="purple" size="sm">Backend Synced</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {themesList.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTheme(t.id, true)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  theme === t.id
                    ? 'border-theme-accent ring-2 ring-theme-accent/30 bg-theme-accent-light'
                    : 'border-theme-border bg-theme-surface hover:border-theme-muted'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0 shadow-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-theme-main leading-tight truncate">{t.name}</h4>
                    <p className="text-[10px] text-theme-muted mt-0.5">{t.id === 'light' ? 'Light Preset' : 'Dark Mode'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: t.previewBg }}
                    title="Background"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: t.secondaryColor || t.color }}
                    title="Accent Color"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Portability & Backup */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-theme-border">
            <ShieldCheck className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Data Portability & Backup Tools</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-4 rounded-2xl border border-theme-border bg-theme-surface hover:border-theme-accent transition text-left space-y-2 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-theme-accent-light text-theme-accent w-fit group-hover:scale-110 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-main">Export App Data (JSON)</h4>
                <p className="text-[10px] text-theme-muted mt-0.5">Download full JSON snapshot of all tasks, notes & applications</p>
              </div>
            </button>

            <label className="p-4 rounded-2xl border border-theme-border bg-theme-surface hover:border-theme-accent transition text-left space-y-2 cursor-pointer group block">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-main">Import App Data (JSON)</h4>
                <p className="text-[10px] text-theme-muted mt-0.5">Upload a previously exported `.json` backup file</p>
              </div>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleResetData}
              className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:border-rose-500 transition text-left space-y-2 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 w-fit group-hover:scale-110 transition-transform">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-400">Reset User Datasets</h4>
                <p className="text-[10px] text-theme-muted mt-0.5">Clear database records for logged-in user back to clean state</p>
              </div>
            </button>
          </div>
        </div>

        {/* Account & Active Session Section */}
        <div className="p-6 rounded-3xl border border-theme-border bg-theme-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-theme-border pb-3">
            <Lock className="h-5 w-5 text-theme-accent" />
            <h3 className="text-base font-bold text-theme-main">Account & Active Session</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-theme-surface border border-theme-border">
            <div>
              <h4 className="text-xs font-bold text-theme-main">Signed in as {name || user.name}</h4>
              <p className="text-[11px] text-theme-muted">{email || user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 font-bold text-xs transition flex items-center space-x-2 w-fit cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of LifeOS</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
