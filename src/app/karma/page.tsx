'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  userId: string;
  fullName: string;
  collegeName: string;
  totalKarma: number;
  periodKarma: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardKarma: number;
  durationDays: number;
  targetCount: number;
  challengeType: string;
  currentCount: number;
  isCompleted: boolean;
  claimedAt: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  category: string;
  createdAt: string;
}

function KarmaContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'leaderboard'; // 'leaderboard' | 'challenges' | 'history'

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'history'>(
    (initialTab as any) || 'leaderboard'
  );
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Data states
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [collegeBreakdown, setCollegeBreakdown] = useState<{ [college: string]: number }>({});
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalKarma, setTotalKarma] = useState(0);
  const [studentsHelped, setStudentsHelped] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKarmaData();
  }, [period]);

  const fetchKarmaData = async () => {
    setIsLoading(true);
    try {
      const [lbRes, chRes, histRes] = await Promise.all([
        fetch(`/api/karma/leaderboard?period=${period}`),
        fetch('/api/karma/challenges'),
        fetch('/api/karma/history'),
      ]);

      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboardUsers(lbData.users || []);
        setCollegeBreakdown(lbData.collegeBreakdown || {});
      }

      if (chRes.ok) {
        const chData = await chRes.json();
        setChallenges(chData.challenges || []);
      }

      if (histRes.ok) {
        const histData = await histRes.json();
        setTransactions(histData.transactions || []);
        setTotalKarma(histData.totalKarma || 0);
        setStudentsHelped(histData.studentsHelped || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTier = (karma: number) => {
    if (karma >= 500) return { name: 'CAMPUS LEGEND', color: 'text-amber-400 border-amber-400/50 bg-amber-400/10' };
    if (karma >= 250) return { name: 'COLLEGIATE SCHOLAR', color: 'text-accentLime border-accentLime/50 bg-accentLime/10' };
    if (karma >= 100) return { name: 'SENIOR CONTRIBUTOR', color: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10' };
    return { name: 'VERIFIED NOVICE', color: 'text-textSecondary border-borderSubtle bg-surfaceElevated' };
  };

  const currentTier = getTier(totalKarma);

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Ledger Overview */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ THE ACADEMIC REPUTATION PROTOCOL ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              KARMA ECONOMY & HONORS
            </h1>
            <p className="mt-1 text-xs text-textSecondary font-mono max-w-xl">
              Earn immutable verified credit for peer tutoring, hosting classes, uploading revision notes, and answering campus queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="border border-borderSubtle bg-surfaceElevated p-4 flex-1 sm:flex-initial min-w-[140px]">
              <span className="font-mono text-[10px] text-textMuted uppercase block">TOTAL BALANCE</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="h-5 w-5 fill-accentLime text-accentLime" />
                <span className="font-mono text-2xl font-bold text-accentLime">{totalKarma}</span>
              </div>
            </div>

            <div className="border border-borderSubtle bg-surfaceElevated p-4 flex-1 sm:flex-initial min-w-[140px]">
              <span className="font-mono text-[10px] text-textMuted uppercase block">PEERS HELPED</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="h-5 w-5 text-textPrimary" />
                <span className="font-mono text-2xl font-bold text-textPrimary">{studentsHelped}</span>
              </div>
            </div>

            <div className="border border-borderSubtle bg-surfaceElevated p-4 flex-1 sm:flex-initial min-w-[140px]">
              <span className="font-mono text-[10px] text-textMuted uppercase block">HONOR STATUS</span>
              <span className={`inline-block mt-1.5 px-2 py-0.5 font-mono text-[11px] font-bold border ${currentTier.color}`}>
                [{currentTier.name}]
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-borderSubtle">
          {[
            { key: 'leaderboard', label: 'CAMPUS LEADERBOARD' },
            { key: 'challenges', label: `ACTIVE CHALLENGES (${challenges.length})` },
            { key: 'history', label: 'LEDGER AUDIT HISTORY' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase transition-colors relative ${
                activeTab === tab.key
                  ? 'text-accentLime border-b-2 border-accentLime bg-surface'
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              [{tab.label}]
            </button>
          ))}
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            {/* Period selector & College breakdown cards */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`border px-4 py-2 font-mono text-xs ${
                    period === 'weekly'
                      ? 'border-accentLime bg-accentLime text-background font-bold'
                      : 'border-borderSubtle bg-surface text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  [ 7-DAY SPRINT ]
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`border px-4 py-2 font-mono text-xs ${
                    period === 'monthly'
                      ? 'border-accentLime bg-accentLime text-background font-bold'
                      : 'border-borderSubtle bg-surface text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  [ 30-DAY TERM ]
                </button>
              </div>

              <span className="font-mono text-xs text-textMuted">
                [ RANKINGS REFRESHED IN REAL-TIME FROM PEER ACTIVITY ]
              </span>
            </div>

            {/* University Comparison Cards */}
            {Object.keys(collegeBreakdown).length > 0 && (
              <div>
                <span className="font-mono text-xs uppercase text-textMuted tracking-wider block mb-3">
                  INTER-COLLEGIATE KARMA ACCUMULATION
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(collegeBreakdown).map(([col, pts]) => (
                    <div key={col} className="border border-borderSubtle bg-surface p-4">
                      <span className="font-mono text-[10px] text-textMuted uppercase block truncate">
                        {col}
                      </span>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-xl font-bold text-accentLime">
                          {pts.toLocaleString()}
                        </span>
                        <span className="font-mono text-[10px] text-textSecondary">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Students Table */}
            <div className="border border-borderSubtle bg-surface overflow-hidden">
              <div className="p-4 border-b border-borderSubtle flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-accentLime flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  [ TOP ACADEMIC CONTRIBUTORS // {period.toUpperCase()} ]
                </span>
                <span className="font-mono text-[10px] text-textMuted">
                  SHOWING TOP 50 VERIFIED SCHOLARS
                </span>
              </div>

              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="mx-auto h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin mb-3" />
                  <p className="font-mono text-xs text-accentLime">[ COMPILING ACADEMIC SCORES... ]</p>
                </div>
              ) : leaderboardUsers.length === 0 ? (
                <p className="p-8 text-center text-xs font-mono text-textMuted">
                  No activity recorded for this time interval yet.
                </p>
              ) : (
                <div className="divide-y divide-borderSubtle">
                  {leaderboardUsers.map((user, idx) => (
                    <div
                      key={user.userId}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        idx === 0
                          ? 'bg-accentLime/5 hover:bg-accentLime/10'
                          : 'hover:bg-surfaceElevated'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-8 w-8 items-center justify-center font-mono text-xs font-black border ${
                            idx === 0
                              ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                              : idx === 1
                              ? 'border-slate-300 bg-slate-300/20 text-slate-200'
                              : idx === 2
                              ? 'border-amber-700 bg-amber-700/20 text-amber-500'
                              : 'border-borderSubtle bg-surface text-textMuted'
                          }`}
                        >
                          #{user.rank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${user.userId}`}
                              className="font-sans text-sm font-bold text-textPrimary hover:text-accentLime transition-colors"
                            >
                              {user.fullName}
                            </Link>
                            {idx === 0 && (
                              <span className="border border-amber-400/60 bg-amber-400/10 px-1.5 py-0.2 font-mono text-[9px] text-amber-300 font-bold">
                                #1 PEER
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-textMuted">
                            {user.collegeName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Zap className="h-3.5 w-3.5 fill-accentLime text-accentLime" />
                          <span className="text-sm font-bold text-accentLime">
                            +{user.periodKarma}
                          </span>
                        </div>
                        <span className="text-[10px] text-textMuted">
                          {user.totalKarma} TOTAL KARMA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="border border-borderSubtle bg-surface p-4 flex items-center justify-between">
              <span className="font-mono text-xs text-textMuted">
                Complete semester sprints to earn immediate bonus Karma into your ledger.
              </span>
              <span className="font-mono text-xs text-accentLime">
                [ AUTOMATIC REPUTATION STAKING ]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((ch) => {
                const progressPct = Math.min(100, Math.round((ch.currentCount / ch.targetCount) * 100));
                return (
                  <div
                    key={ch.id}
                    className={`border p-6 space-y-4 ${
                      ch.isCompleted
                        ? 'border-accentLime/50 bg-accentLime/5'
                        : 'border-borderSubtle bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] text-accentLime bg-accentLime/10 border border-accentLime/30 px-2 py-0.5 uppercase">
                          [{ch.challengeType.replace(/_/g, ' ')}]
                        </span>
                        <h3 className="font-sans text-lg font-bold uppercase text-textPrimary mt-2">
                          {ch.title}
                        </h3>
                      </div>

                      <div className="border border-accentLime bg-accentLime/10 px-3 py-1 text-right font-mono shrink-0">
                        <span className="text-xs text-textMuted block text-[9px]">BOUNTY</span>
                        <span className="text-accentLime font-bold text-sm">+{ch.rewardKarma} KP</span>
                      </div>
                    </div>

                    <p className="text-xs font-mono text-textSecondary leading-relaxed">
                      {ch.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-textMuted">Progress</span>
                        <span className="text-accentLime font-bold">
                          {ch.currentCount} / {ch.targetCount} ({progressPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surfaceElevated border border-borderSubtle overflow-hidden">
                        <div
                          className="h-full bg-accentLime transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="border-t border-borderSubtle pt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-textMuted flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {ch.durationDays} DAYS DURATION
                      </span>

                      {ch.isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-accentLime font-bold">
                          <CheckCircle2 className="h-4 w-4" /> [ COMPLETED & CLAIMED ]
                        </span>
                      ) : (
                        <span className="text-textMuted">[ IN PROGRESS ]</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LEDGER HISTORY */}
        {activeTab === 'history' && (
          <div className="border border-borderSubtle bg-surface overflow-hidden">
            <div className="p-4 border-b border-borderSubtle flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-accentLime font-bold">
                [ PERSONAL KARMA LEDGER AUDIT TRAIL ]
              </span>
              <span className="font-mono text-[10px] text-textMuted">
                {transactions.length} TRANSACTIONS RECORDED
              </span>
            </div>

            {transactions.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-textMuted">
                No transactions recorded yet. Join a study session, upload notes, or teach a class to start earning!
              </p>
            ) : (
              <div className="divide-y divide-borderSubtle">
                {transactions.map((tx) => {
                  const isPositive = tx.amount >= 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-surfaceElevated transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center border font-mono text-xs ${
                            isPositive
                              ? 'border-accentLime/40 bg-accentLime/10 text-accentLime'
                              : 'border-red-500/40 bg-red-500/10 text-red-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <span className="font-sans text-xs font-bold text-textPrimary uppercase block">
                            {tx.reason}
                          </span>
                          <span className="font-mono text-[10px] text-textMuted">
                            Category: {tx.category} · {new Date(tx.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-sm font-bold ${
                          isPositive ? 'text-accentLime' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? `+${tx.amount}` : tx.amount} KP
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KarmaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center">
          <div className="h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin" />
        </div>
      }
    >
      <KarmaContent />
    </Suspense>
  );
}
