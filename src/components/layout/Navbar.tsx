'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  LogOut,
  User,
  Compass,
  Calendar,
  Layers,
  BookOpen,
  MessageSquare,
  Users,
  Award,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  collegeName: string;
  isVerified: boolean;
  totalKarma: number;
}

interface NavbarProps {
  onOpenSearch?: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [pathname]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.profile?.fullName || 'Student',
            collegeName: data.user.college?.name || 'University',
            isVerified: data.user.isVerified,
            totalKarma: data.user.profile?.totalKarma || 0,
          });
          setUnreadCount(data.user.unreadNotifications || 0);
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: 'DASHBOARD', href: '/dashboard' },
    { label: 'TIMELINE', href: '/timeline' },
    { label: 'AI SCANNER', href: '/scanner', badge: 'AI' },
    { label: 'CLASSES', href: '/classes' },
    { label: 'AI MENTORS', href: '/mentors', badge: 'AI' },
    { label: 'HELP FEED', href: '/requests' },
    { label: 'RESOURCES', href: '/resources' },
    { label: 'NETWORK', href: '/connections' },
    { label: 'PROJECTS', href: '/projects' },
    { label: 'COMMUNITIES', href: '/communities' },
    { label: 'LEADERBOARD', href: '/karma/leaderboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-borderSubtle bg-[#0A0C0E]/95 backdrop-blur-md">
      {/* Micro ticker / campus status bar */}
      <div className="hidden border-b border-borderSubtle/60 px-6 py-1 text-[11px] font-mono tracking-wider text-textMuted lg:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-accentLime">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accentLime animate-pulse" />
            [ VERIFIED CAMPUS NETWORK ]
          </span>
          <span className="text-borderLight">|</span>
          <span>AUTUMN 2026 ACADEMIC SESSION</span>
          <span className="text-borderLight">|</span>
          <span>PEER LEARNING & COLLABORATION PLATFORM</span>
        </div>
        <div className="flex items-center gap-4">
          <span>STANFORD · MIT · BERKELEY · CMU</span>
          <span className="text-borderLight">|</span>
          <Link href="/karma/challenges" className="hover:text-accentLime transition-colors">
            [ ACTIVE KARMA CHALLENGES ]
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-accentLime/80 bg-accentLime/10 text-accentLime font-mono text-sm font-black transition-transform group-hover:scale-105">
              ✦
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-lg font-black tracking-tighter text-textPrimary uppercase">
                UNIVERSITY <span className="text-accentLime">HUB</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-textMuted -mt-1">
                [ VERIFIED NETWORK ]
              </span>
            </div>
          </Link>

          {/* Desktop primary links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.slice(0, 7).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 font-mono text-xs tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'text-accentLime bg-accentLime/10 border-b-2 border-accentLime font-bold'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
                  }`}
                >
                  [{' '}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] text-accentLime font-mono">✦</span>
                  )}
                  {' ]'}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right tools and user info */}
        <div className="flex items-center gap-3">
          {/* Global Search button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 border border-borderSubtle bg-surface px-3 py-1.5 text-xs font-mono text-textSecondary hover:border-accentLime/60 hover:text-textPrimary transition-colors"
            title="Global search (Ctrl+K / Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-accentLime" />
            <span className="hidden sm:inline">[ SEARCH ]</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 bg-surfaceElevated border border-borderSubtle text-[10px] text-textMuted">
              ⌘K
            </kbd>
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 items-center justify-center border border-borderSubtle bg-surface text-textSecondary hover:text-accentLime hover:border-borderLight transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center bg-accentLime text-background font-mono text-[10px] font-black px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Chat direct link */}
              <Link
                href="/chat"
                className="relative flex h-9 w-9 items-center justify-center border border-borderSubtle bg-surface text-textSecondary hover:text-accentLime hover:border-borderLight transition-colors"
                title="Private Messages"
              >
                <MessageSquare className="h-4 w-4" />
              </Link>

              {/* Karma status chip */}
              <Link
                href="/karma"
                className="hidden sm:flex items-center gap-1.5 border border-accentLime/40 bg-accentLime/10 px-2.5 py-1 text-xs font-mono text-accentLime hover:bg-accentLime/20 transition-colors"
              >
                <Zap className="h-3.5 w-3.5 fill-accentLime text-accentLime" />
                <span>{user.totalKarma} KARMA</span>
              </Link>

              {/* User profile dropdown button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 border border-borderSubtle bg-surface p-1 hover:border-accentLime/50 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center bg-surfaceElevated text-accentLime font-mono text-xs font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden text-left md:block pr-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-textPrimary leading-none">
                        {user.fullName}
                      </span>
                      {user.isVerified && (
                        <ShieldCheck className="h-3 w-3 text-accentLime" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-textMuted uppercase">
                      {user.collegeName.split(' ')[0]}
                    </span>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 border border-borderLight bg-surfaceElevated p-2 shadow-2xl z-50"
                  >
                    <div className="border-b border-borderSubtle p-2 mb-1">
                      <p className="text-xs font-bold text-textPrimary">{user.fullName}</p>
                      <p className="text-[11px] font-mono text-textMuted truncate">{user.email}</p>
                      <p className="mt-1 text-[10px] font-mono text-accentLime">
                        [ VERIFIED STUDENT ]
                      </p>
                    </div>

                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-textSecondary hover:bg-surface hover:text-textPrimary"
                    >
                      <User className="h-3.5 w-3.5 text-accentLime" />
                      Portfolio & Profile
                    </Link>
                    <Link
                      href="/karma"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-textSecondary hover:bg-surface hover:text-textPrimary"
                    >
                      <Award className="h-3.5 w-3.5 text-accentLime" />
                      Karma Ledger & Badges
                    </Link>
                    <Link
                      href="/classes/teach"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-textSecondary hover:bg-surface hover:text-textPrimary"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-accentLime" />
                      Teach a Skill Class
                    </Link>

                    <div className="border-t border-borderSubtle my-1" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:bg-surface hover:text-red-300"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 font-mono text-xs text-textSecondary hover:text-textPrimary transition-colors"
              >
                [ LOGIN ]
              </Link>
              <Link
                href="/register"
                className="border border-accentLime bg-accentLime px-3 py-1.5 font-mono text-xs font-bold text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
              >
                JOIN WITH COLLEGE ID
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center border border-borderSubtle bg-surface text-textSecondary hover:text-textPrimary xl:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-borderSubtle bg-surfaceElevated px-4 py-4 xl:hidden">
          <nav className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between border border-borderSubtle p-2 font-mono text-xs ${
                  pathname === item.href
                    ? 'border-accentLime bg-accentLime/10 text-accentLime font-bold'
                    : 'text-textSecondary hover:border-borderLight hover:text-textPrimary'
                }`}
              >
                <span>[ {item.label} ]</span>
                {item.badge && <span className="text-[10px] text-accentLime">✦</span>}
              </Link>
            ))}
          </nav>

          {!user && (
            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-borderSubtle">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2 text-center font-mono text-xs border border-borderSubtle text-textPrimary"
              >
                [ LOGIN TO HUB ]
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2 text-center font-mono text-xs bg-accentLime text-background font-bold"
              >
                REGISTER WITH COLLEGE EMAIL
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
