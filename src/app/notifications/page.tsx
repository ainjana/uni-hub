'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Zap,
  BookOpen,
  Users,
  Briefcase,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.error(e);
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'KARMA':
        return <Zap className="h-4 w-4 fill-accentLime text-accentLime" />;
      case 'CLASS':
        return <BookOpen className="h-4 w-4 text-cyan-400" />;
      case 'PROJECT':
        return <Briefcase className="h-4 w-4 text-amber-400" />;
      case 'CONNECTION':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'CHAT':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-accentLime" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.isRead;
    return n.type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ CAMPUS INBOX & ACTIVITY DISPATCH ]
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-black uppercase tracking-tight text-textPrimary flex items-center gap-3">
              NOTIFICATIONS
              {unreadCount > 0 && (
                <span className="border border-accentLime bg-accentLime text-background font-mono text-xs px-2 py-0.5 font-bold">
                  {unreadCount} NEW
                </span>
              )}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="border border-borderLight bg-surfaceElevated px-4 py-2 font-mono text-xs font-bold text-accentLime hover:border-accentLime hover:bg-accentLime/10 transition-colors"
            >
              [ MARK ALL AS READ ]
            </button>
          )}
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-borderSubtle">
          {[
            { key: 'ALL', label: 'ALL ACTIVITY' },
            { key: 'UNREAD', label: `UNREAD (${unreadCount})` },
            { key: 'KARMA', label: 'KARMA REWARDS' },
            { key: 'CLASS', label: 'ACADEMIC SESSIONS' },
            { key: 'PROJECT', label: 'LAB PROJECTS' },
            { key: 'CONNECTION', label: 'CONNECTIONS' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                filterType === tab.key
                  ? 'border-b-2 border-accentLime text-accentLime bg-surface'
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              [{tab.label}]
            </button>
          ))}
        </div>

        {/* Notification List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-xs text-accentLime">[ RETRIEVING DISPATCHES... ]</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="border border-borderSubtle bg-surface p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-textMuted mb-3" />
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">NO NOTIFICATIONS</h3>
            <p className="mt-1 text-xs text-textSecondary font-mono">
              You are completely caught up with all campus alerts and peer activities.
            </p>
          </div>
        ) : (
          <div className="border border-borderSubtle bg-surface divide-y divide-borderSubtle">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex flex-col sm:flex-row items-start justify-between gap-4 transition-colors ${
                  !notif.isRead
                    ? 'bg-accentLime/5 hover:bg-accentLime/10'
                    : 'hover:bg-surfaceElevated'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Category icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-borderSubtle bg-surfaceElevated">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-bold uppercase text-textPrimary">
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-accentLime animate-ping" />
                      )}
                      <span className="font-mono text-[10px] text-textMuted uppercase border border-borderSubtle px-1.5 py-0.2">
                        {notif.type}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-textSecondary leading-relaxed">
                      {notif.message}
                    </p>

                    <span className="block font-mono text-[10px] text-textMuted pt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className="flex items-center gap-1 border border-borderLight bg-surface px-3 py-1.5 font-mono text-xs text-accentLime hover:border-accentLime hover:bg-accentLime/10 transition-colors whitespace-nowrap"
                    >
                      <span>[ VIEW ]</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-textMuted hover:text-textPrimary text-xs font-mono"
                      title="Mark as read"
                    >
                      [ DISMISS ]
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
