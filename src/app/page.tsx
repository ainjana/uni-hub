'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  BookOpen,
  Calendar,
  FileScan,
  Users,
  Award,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    colleges: 4,
    students: 150,
    classes: 12,
    karmaAwarded: 4800,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0C0E] text-textPrimary">
      {/* Editorial Hero Section (AURALEE Style) */}
      <section className="relative border-b border-borderSubtle px-4 pt-16 pb-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid line accents */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#22252C_1px,transparent_1px),linear-gradient(to_bottom,#22252C_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative mx-auto max-w-7xl">
          {/* Header Metadata Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2 border border-accentLime/50 bg-accentLime/10 px-3 py-1 font-mono text-xs text-accentLime">
              <span className="h-2 w-2 rounded-full bg-accentLime animate-ping" />
              <span>[ SPRING SEMESTER 2026 ]</span>
            </div>
            <div className="font-mono text-xs text-textMuted tracking-widest hidden sm:block">
              [ VERIFIED COLLEGIATE PLATFORM // AUTHENTICATED .EDU ONLY ]
            </div>
          </div>

          {/* Massive Display Heading */}
          <div className="mb-10 max-w-5xl">
            <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-textPrimary leading-none">
              A VERIFIED SOCIAL <br />
              <span className="text-accentLime bg-accentLime/10 px-2 inline-block my-1">LEARNING NETWORK</span> <br />
              FOR UNIVERSITY STUDENTS.
            </h1>
            <p className="mt-6 font-mono text-sm sm:text-base text-textSecondary max-w-2xl leading-relaxed">
              Discover academic intelligence, teach and learn high-impact technical skills, exchange verified study resources, and forge reputation through contribution-based Karma.
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-3 border border-accentLime bg-accentLime px-6 py-3 font-mono text-sm font-bold text-background hover:bg-accentLimeHover transition-all shadow-glow-lime"
              >
                <span>[ GO TO PERSONAL DASHBOARD ]</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group flex items-center gap-3 border border-accentLime bg-accentLime px-6 py-3 font-mono text-sm font-bold text-background hover:bg-accentLimeHover transition-all shadow-glow-lime"
                >
                  <span>[ JOIN WITH COLLEGE EMAIL ]</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 border border-borderLight bg-surface px-6 py-3 font-mono text-sm text-textPrimary hover:border-accentLime/60 transition-colors"
                >
                  [ SIGN IN / DEMO ACCESS ]
                </Link>
              </>
            )}
            <Link
              href="/scanner"
              className="flex items-center gap-2 border border-borderSubtle bg-transparent px-4 py-3 font-mono text-xs text-textSecondary hover:text-accentLime transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-accentLime" />
              <span>TEST AI NOTICE SCANNER</span>
            </Link>
          </div>

          {/* Architectural Metadata Bar */}
          <div className="mt-16 pt-8 border-t border-borderSubtle/60 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
            <div>
              <p className="text-xs text-textMuted uppercase">[ PARTICIPATING CAMPUSES ]</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-textPrimary">STANFORD · MIT · UC BERKELEY · CMU</p>
            </div>
            <div>
              <p className="text-xs text-textMuted uppercase">[ CORE ARCHITECTURE ]</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-accentLime">POSTGRESQL + PRISMA + GEMINI AI</p>
            </div>
            <div>
              <p className="text-xs text-textMuted uppercase">[ REPUTATION LEDGER ]</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-textPrimary">IMMUTABLE KARMA TRANSACTIONS</p>
            </div>
            <div>
              <p className="text-xs text-textMuted uppercase">[ ACCESS MODEL ]</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-textPrimary">100% VERIFIED STUDENT PROFILES</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: Editorial Brutalist 4-Column Layout */}
      <section className="border-b border-borderSubtle py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accentLime block mb-1">
                [ SYSTEM MODULES ]
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-black uppercase tracking-tight text-textPrimary">
                DESIGNED FOR ACADEMIC CLARITY
              </h2>
            </div>
            <p className="font-mono text-xs text-textMuted max-w-md">
              No generic admin widgets. Every surface is tuned to student collaboration, schedule synthesis, and peer mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/50 transition-all">
              <div>
                <span className="font-mono text-xs text-accentLime">[ 01 / SCANNER ]</span>
                <div className="my-4 flex h-10 w-10 items-center justify-center border border-borderSubtle bg-surfaceElevated text-accentLime">
                  <FileScan className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-base font-bold uppercase text-textPrimary mb-2">
                  AI Campus Notice Scanner
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Upload PDF exam schedules, syllabus posters, or lecture timetables. AI parses dates, venues, and deadlines and maps them directly to your personal timeline.
                </p>
              </div>
              <Link
                href="/scanner"
                className="mt-6 flex items-center gap-1.5 font-mono text-xs text-accentLime hover:underline"
              >
                <span>[ SCAN DOCUMENT ]</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/50 transition-all">
              <div>
                <span className="font-mono text-xs text-accentLime">[ 02 / PEER TEACHING ]</span>
                <div className="my-4 flex h-10 w-10 items-center justify-center border border-borderSubtle bg-surfaceElevated text-accentLime">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-base font-bold uppercase text-textPrimary mb-2">
                  Teach & Learn Skills
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Students host focused peer classes (Java Concurrency, PyTorch, Figma, System Design). Strict seat management prevents overbooking and awards verified Karma.
                </p>
              </div>
              <Link
                href="/classes"
                className="mt-6 flex items-center gap-1.5 font-mono text-xs text-accentLime hover:underline"
              >
                <span>[ EXPLORE CLASSES ]</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/50 transition-all">
              <div>
                <span className="font-mono text-xs text-accentLime">[ 03 / AI MATCHING ]</span>
                <div className="my-4 flex h-10 w-10 items-center justify-center border border-borderSubtle bg-surfaceElevated text-accentLime">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-base font-bold uppercase text-textPrimary mb-2">
                  Semantic Mentor Matching
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Type natural language requests like “I need help debugging Red-Black trees in Java.” AI evaluates skill depth, ratings, availability, and explains why a mentor matches.
                </p>
              </div>
              <Link
                href="/mentors"
                className="mt-6 flex items-center gap-1.5 font-mono text-xs text-accentLime hover:underline"
              >
                <span>[ FIND MENTOR ]</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pillar 4 */}
            <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/50 transition-all">
              <div>
                <span className="font-mono text-xs text-accentLime">[ 04 / REPUTATION ]</span>
                <div className="my-4 flex h-10 w-10 items-center justify-center border border-borderSubtle bg-surfaceElevated text-accentLime">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-base font-bold uppercase text-textPrimary mb-2">
                  Immutable Karma Ledger
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Every point of Karma corresponds to actual peer contribution: hosting classes (+50), resolving help inquiries (+30), and uploading verified resources (+25).
                </p>
              </div>
              <Link
                href="/karma/leaderboard"
                className="mt-6 flex items-center gap-1.5 font-mono text-xs text-accentLime hover:underline"
              >
                <span>[ VIEW LEADERBOARDS ]</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Upcoming Sessions Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-borderSubtle bg-surface/40">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase text-accentLime block mb-1">
                [ LIVE DISCOVERY ]
              </span>
              <h2 className="font-sans text-2xl font-black uppercase text-textPrimary">
                UPCOMING STUDENT-LED SESSIONS
              </h2>
            </div>
            <Link
              href="/classes"
              className="font-mono text-xs text-accentLime hover:underline"
            >
              [ VIEW ALL CLASSES → ]
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-borderSubtle bg-surfaceElevated p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="border border-accentLime/40 bg-accentLime/10 px-2 py-0.5 font-mono text-[11px] text-accentLime font-bold">
                    [ 3 SEATS LEFT ]
                  </span>
                  <span className="font-mono text-xs text-textMuted">TOMORROW 4:00 PM</span>
                </div>
                <h3 className="font-sans text-base font-bold text-textPrimary mb-2">
                  Java Concurrency & Thread Synchronization Deep Dive
                </h3>
                <p className="text-xs text-textSecondary mb-4">
                  Lock-free data structures, atomics, and practical multi-threaded debug patterns.
                </p>
              </div>
              <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-accentLime/20 text-accentLime font-mono text-xs flex items-center justify-center font-bold">
                    A
                  </div>
                  <span className="text-xs font-semibold text-textPrimary">Alex Chen · Stanford</span>
                </div>
                <Link
                  href="/classes"
                  className="font-mono text-xs text-accentLime hover:underline"
                >
                  [ DETAILS ]
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-borderSubtle bg-surfaceElevated p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="border border-accentLime/40 bg-accentLime/10 px-2 py-0.5 font-mono text-[11px] text-accentLime font-bold">
                    [ 4 SEATS LEFT ]
                  </span>
                  <span className="font-mono text-xs text-textMuted">IN 2 DAYS 6:00 PM</span>
                </div>
                <h3 className="font-sans text-base font-bold text-textPrimary mb-2">
                  Python for Deep Learning: From NumPy Tensors to Transformers
                </h3>
                <p className="text-xs text-textSecondary mb-4">
                  Hands-on attention mechanisms from scratch using vector math and PyTorch tensors.
                </p>
              </div>
              <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-accentLime/20 text-accentLime font-mono text-xs flex items-center justify-center font-bold">
                    P
                  </div>
                  <span className="text-xs font-semibold text-textPrimary">Priya Patel · MIT</span>
                </div>
                <Link
                  href="/classes"
                  className="font-mono text-xs text-accentLime hover:underline"
                >
                  [ DETAILS ]
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-borderSubtle bg-surfaceElevated p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="border border-accentLime/40 bg-accentLime/10 px-2 py-0.5 font-mono text-[11px] text-accentLime font-bold">
                    [ 2 SEATS LEFT ]
                  </span>
                  <span className="font-mono text-xs text-textMuted">SATURDAY 2:00 PM</span>
                </div>
                <h3 className="font-sans text-base font-bold text-textPrimary mb-2">
                  Design Systems in Figma & Modern Tailwind CSS
                </h3>
                <p className="text-xs text-textSecondary mb-4">
                  Bridging the gap between Figma auto-layout and responsive React Tailwind components.
                </p>
              </div>
              <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-accentLime/20 text-accentLime font-mono text-xs flex items-center justify-center font-bold">
                    M
                  </div>
                  <span className="text-xs font-semibold text-textPrimary">Marcus Vance · Berkeley</span>
                </div>
                <Link
                  href="/classes"
                  className="font-mono text-xs text-accentLime hover:underline"
                >
                  [ DETAILS ]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Login CTA Box */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-accentLime/60 bg-surfaceElevated p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase text-accentLime block mb-1">
                [ INSTANT ACCESS ]
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-black uppercase text-textPrimary">
                TRY UNIVERSITY HUB RIGHT NOW
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-textSecondary max-w-lg">
                Sign in with the pre-seeded Stanford demo account or register your collegiate email to start learning and teaching.
              </p>
              <p className="mt-2 font-mono text-xs text-accentLime">
                Demo Account: demo.student@stanford.edu / password123
              </p>
            </div>
            <Link
              href="/login"
              className="border border-accentLime bg-accentLime px-6 py-3 font-mono text-xs font-bold text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime whitespace-nowrap"
            >
              [ LAUNCH DEMO LOGIN ]
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
