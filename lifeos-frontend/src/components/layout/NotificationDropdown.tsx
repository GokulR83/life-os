import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Briefcase,
  Flame,
  BookOpen,
  AlertCircle,
  X,
  ExternalLink,
  Filter,
  DollarSign,
  Brain
} from 'lucide-react';
import { Badge } from '../common/Badge';

import { apiSdk } from '../../services/apiSdk';
import { subscribeToEntityChanges } from '../../services/socketClient';

const ICON_MAP: Record<string, any> = {
  AlertCircle,
  Brain,
  Briefcase,
  Flame,
  DollarSign,
  BookOpen,
  Bell,
};

export const NotificationDropdown = ({ isOpen, onClose, setUnreadCount, triggerRef = null }: any) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [apiNotifications, setApiNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotificationsFromApi = async () => {
    try {
      const data = await apiSdk.notifications.getAll();
      if (Array.isArray(data)) {
        setApiNotifications(data);
      }
    } catch (err) {
      console.warn('[NOTIFICATION] API fetch error:', err);
    }
  };

  useEffect(() => {
    fetchNotificationsFromApi();

    // Subscribe to WebSocket real-time changes
    const unsubscribe = subscribeToEntityChanges(() => {
      fetchNotificationsFromApi();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const unreadCount = apiNotifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (setUnreadCount) {
      setUnreadCount(unreadCount);
    }
  }, [unreadCount, setUnreadCount]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: any) => {
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

  const handleMarkAllRead = async () => {
    try {
      await apiSdk.notifications.markAllRead();
      setApiNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      console.warn('[NOTIFICATION] Mark all read error:', err);
    }
  };

  const handleNotificationClick = async (item: any) => {
    try {
      await apiSdk.notifications.markAllRead([item.id]);
      setApiNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
    } catch (err) {}
    if (item.link) {
      navigate(item.link);
    }
    onClose();
  };

  const filteredNotifications = apiNotifications.filter((n) => {
    if (activeTab === 'unread') return n.unread;
    if (activeTab === 'task') return n.type === 'task' || n.type === 'streak';
    if (activeTab === 'career') return n.type === 'career' || n.type === 'study';
    return true;
  });

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-3xl border border-theme-border bg-theme-card/95 backdrop-blur-2xl shadow-2xl p-4 space-y-3.5 animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {/* Header Title & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-border">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-theme-accent-light text-theme-accent">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-theme-main leading-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-theme-accent text-white text-[10px] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <p className="text-[10px] text-theme-muted">Alerts, deadline updates & streak milestones</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-accent hover:bg-theme-surface transition cursor-pointer flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold">Mark Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold">
        {[
          { id: 'all', label: `All (${apiNotifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'task', label: 'Tasks' },
          { id: 'career', label: 'Career & Study' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1 rounded-lg text-[11px] transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-theme-accent text-white shadow-sm font-bold'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const IconComponent = typeof item.icon === 'string' ? (ICON_MAP[item.icon] || Bell) : (item.icon || Bell);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 rounded-2xl border transition-all duration-150 flex items-start space-x-3 cursor-pointer group ${
                  item.unread
                    ? 'bg-theme-accent-light/50 border-theme-accent/40 shadow-sm'
                    : 'bg-theme-surface/70 border-theme-border hover:border-theme-accent/50 opacity-80 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${item.unread ? 'text-theme-main font-extrabold' : 'text-theme-main'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-theme-muted shrink-0 ml-1">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-theme-muted leading-snug line-clamp-2">{item.message}</p>
                </div>

                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-theme-accent shrink-0 mt-1" />
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center space-y-2">
            <Bell className="h-8 w-8 text-theme-muted mx-auto opacity-40" />
            <p className="text-xs font-bold text-theme-main">No notifications found</p>
            <p className="text-[11px] text-theme-muted">You are all caught up! Clear schedule ahead.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-theme-border flex items-center justify-between text-[10px] text-theme-muted">
        <span>Updated in real-time</span>
        <button
          onClick={() => {
            navigate('/settings');
            onClose();
          }}
          className="text-theme-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          Notification Settings <ExternalLink className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};
