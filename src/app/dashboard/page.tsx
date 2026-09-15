'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileScan,
  AlertTriangle,
  Users,
  ChevronRight,
  ExternalLink,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterQuick = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register' }),
      });
      const result = await res.json();
      if (res.ok) {
        setActionMessage('Successfully registered! Added to your schedule.');
        fetchDashboard();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        alert(result.error || 'Failed to register');
      }
    } catch {
      alert('Error registering for class');
    }
  };

  const handleConnectQuick = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        setActionMessage('Connection request dispatched!');
        fetchDashboard();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch {
      alert('Error connecting');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="h-24 bg-surface animate-pulse border border-borderSubtle" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-surface animate-pulse border border-borderSubtle" />
            <div className="h-64 bg-surface animate-pulse border border-borderSubtle" />
            <div className="h-64 bg-surface animate-pulse border border-borderSubtle" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    student,
    upcomingEvents,
    upcomingExams,
    upcomingDeadlines,
    registeredClasses,
    recommendedClasses,
    relevantRequests,
    relevantNotices,
    suggestedConnections,
  } = data;

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Flash action message if triggered */}
        {actionMessage && (
          <div className="border border-accentLime bg-accentLime/10 p-3 text-xs font-mono text-accentLime flex items-center justify-between">
            <span>[ STATUS: {actionMessage} ]</span>
            <button onClick={() => setActionMessage('')} className="text-textMuted hover:text-white">✕</button>
          </div>
        )}

        {/* Personalized Header Box */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs uppercase text-accentLime font-bold">
                  [ WHAT MATTERS RIGHT NOW ]
                </span>
                <span className="text-borderLight">|</span>
                <span className="font-mono text-xs text-textMuted uppercase">
                  SEMESTER {student.semester} · {student.course}
                </span>
              </div>
              <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
                WELCOME BACK, {student.fullName.toUpperCase()}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-textSecondary">
                <span className="flex items-center gap-1 text-accentLime">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  [ {student.collegeName.toUpperCase()} VERIFIED ]
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 fill-accentLime text-accentLime" />
                  {student.totalKarma} KARMA
                </span>
                <span>·</span>
                <span>{student.studentsHelped} PEERS HELPED</span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/scanner"
                className="flex items-center gap-2 border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
              >
                <FileScan className="h-3.5 w-3.5" />
                <span>[ SCAN NOTICE ]</span>
              </Link>
              <Link
                href="/classes/teach"
                className="flex items-center gap-2 border border-borderLight bg-surfaceElevated px-4 py-2 font-mono text-xs text-textPrimary hover:border-accentLime/60 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-accentLime" />
                <span>[ TEACH SKILL ]</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Urgent Timeline Feed (Exams & Urgent Deadlines) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Exams & Urgent Tasks */}
          <div className="lg:col-span-2 border border-borderSubtle bg-surface p-6">
            <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime">
                  [ ACADEMIC TIMELINE RADAR ]
                </span>
                <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                  UPCOMING EXAMS & CRITICAL DEADLINES
                </h2>
              </div>
              <Link
                href="/timeline"
                className="font-mono text-xs text-accentLime hover:underline flex items-center gap-1"
              >
                <span>[ VIEW ALL ]</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-textMuted border border-dashed border-borderSubtle">
                No immediate exams or deadlines detected. Scan an academic notice to populate your calendar.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 4).map((item: any) => {
                  const isExam = item.category === 'Exam';
                  const isDeadline = item.category === 'Deadline';
                  return (
                    <div
                      key={item.id}
                      className="border border-borderSubtle bg-surfaceElevated p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-borderLight transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 font-mono text-[10px] font-bold ${
                              isExam
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : isDeadline
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                : 'bg-accentLime/20 text-accentLime border border-accentLime/40'
                            }`}
                          >
                            [ {item.category.toUpperCase()} ]
                          </span>
                          <span className="font-mono text-xs text-textMuted">
                            {item.date} {item.time && `· ${item.time}`}
                          </span>
                        </div>
                        <h3 className="font-sans text-sm font-bold text-textPrimary">
                          {item.title}
                        </h3>
                        {item.location && (
                          <p className="font-mono text-[11px] text-textMuted">
                            Location: {item.location}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 font-mono text-xs text-textMuted flex items-center gap-2">
                        <span className="text-[10px] text-accentLime">
                          Relevance: {(item.relevanceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Notice Highlights */}
          <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
                <div>
                  <span className="font-mono text-xs uppercase text-accentLime">
                    [ CAMPUS RADAR ]
                  </span>
                  <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                    NOTICES FOR SEMESTER {student.semester}
                  </h2>
                </div>
              </div>

              {relevantNotices.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-textMuted">
                  No verified notices published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {relevantNotices.map((n: any) => (
                    <div
                      key={n.id}
                      className="border border-borderSubtle bg-surfaceElevated p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-accentLime">
                          [ {n.docType.toUpperCase()} ]
                        </span>
                        <span className="font-mono text-[10px] text-textMuted">VERIFIED</span>
                      </div>
                      <h4 className="text-xs font-bold text-textPrimary line-clamp-1">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-textSecondary line-clamp-2">
                        {n.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/scanner"
              className="mt-4 flex items-center justify-center gap-2 border border-borderLight bg-surfaceElevated py-2.5 font-mono text-xs text-accentLime hover:border-accentLime transition-colors"
            >
              <FileScan className="h-3.5 w-3.5" />
              <span>[ SCAN NEW CAMPUS NOTICE ]</span>
            </Link>
          </div>
        </div>

        {/* Section 2: Registered Classes & Recommended Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registered Classes */}
          <div className="border border-borderSubtle bg-surface p-6">
            <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime">
                  [ ACTIVE ENROLLMENTS ]
                </span>
                <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                  MY REGISTERED CLASSES
                </h2>
              </div>
              <Link
                href="/classes"
                className="font-mono text-xs text-accentLime hover:underline"
              >
                [ BROWSE ALL ]
              </Link>
            </div>

            {registeredClasses.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-textMuted border border-dashed border-borderSubtle">
                You haven’t registered for any peer classes yet. Explore student masterclasses below!
              </div>
            ) : (
              <div className="space-y-3">
                {registeredClasses.map((c: any) => (
                  <div
                    key={c.id}
                    className="border border-borderSubtle bg-surfaceElevated p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-accentLime font-bold">
                          [ {c.skill?.name} ]
                        </span>
                        <span className="font-mono text-xs text-textMuted">
                          {new Date(c.dateTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-textPrimary">{c.title}</h4>
                      <p className="font-mono text-[11px] text-textMuted">
                        Host: {c.teacher?.profile?.fullName} ({c.teacher?.college?.name})
                      </p>
                    </div>
                    <Link
                      href={`/classes/${c.id}`}
                      className="border border-borderLight px-3 py-1.5 font-mono text-xs text-accentLime hover:border-accentLime"
                    >
                      [ ENTER ]
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Learning Opportunities */}
          <div className="border border-borderSubtle bg-surface p-6">
            <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime">
                  [ PEER DISCOVERY ]
                </span>
                <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                  RECOMMENDED CLASSES FOR YOU
                </h2>
              </div>
              <Link
                href="/classes/teach"
                className="font-mono text-xs text-textSecondary hover:text-accentLime"
              >
                [ + TEACH A CLASS ]
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedClasses.slice(0, 3).map((c: any) => (
                <div
                  key={c.id}
                  className="border border-borderSubtle bg-surfaceElevated p-4 flex justify-between items-center"
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] bg-accentLime/10 text-accentLime px-1.5 py-0.5 font-bold">
                        [ {c.seatsAvailable} SEATS LEFT ]
                      </span>
                      <span className="font-mono text-xs text-textMuted">
                        {c.skill?.name}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-textPrimary line-clamp-1">{c.title}</h4>
                    <p className="font-mono text-[11px] text-textMuted">
                      Taught by {c.teacher?.profile?.fullName} · {c.teacher?.college?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRegisterQuick(c.id)}
                    className="shrink-0 border border-accentLime bg-accentLime/10 px-3 py-1.5 font-mono text-xs font-bold text-accentLime hover:bg-accentLime hover:text-background transition-colors"
                  >
                    [ REGISTER ]
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Skill Requests Feed & Suggested Connections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Relevant Skill Requests */}
          <div className="lg:col-span-2 border border-borderSubtle bg-surface p-6">
            <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime">
                  [ COMMUNITY HELP REQUESTS ]
                </span>
                <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                  PEERS SEEKING GUIDANCE
                </h2>
              </div>
              <Link
                href="/requests"
                className="font-mono text-xs text-accentLime hover:underline"
              >
                [ VIEW ALL REQUESTS ]
              </Link>
            </div>

            <div className="space-y-3">
              {relevantRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="border border-borderSubtle bg-surfaceElevated p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 ${
                          req.urgency === 'HIGH' || req.urgency === 'URGENT'
                            ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                            : 'text-accentLime bg-accentLime/10'
                        }`}
                      >
                        [ {req.urgency} ]
                      </span>
                      <span className="font-mono text-xs text-textMuted">
                        Topic: {req.skillName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-textPrimary">{req.title}</h4>
                    <p className="font-mono text-[11px] text-textMuted">
                      Asked by {req.author?.profile?.fullName} · {req.author?.college?.name}
                    </p>
                  </div>
                  <Link
                    href={`/requests/${req.id}`}
                    className="border border-borderLight bg-surface px-3 py-1.5 font-mono text-xs text-accentLime hover:border-accentLime whitespace-nowrap"
                  >
                    [ OFFER HELP (+30 KARMA) ]
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Student Connections */}
          <div className="border border-borderSubtle bg-surface p-6">
            <div className="flex justify-between items-center mb-5 border-b border-borderSubtle pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime">
                  [ PEER NETWORKING ]
                </span>
                <h2 className="font-sans text-lg font-black uppercase text-textPrimary">
                  SAME CAMPUS PEERS
                </h2>
              </div>
              <Link
                href="/connections"
                className="font-mono text-xs text-accentLime hover:underline"
              >
                [ EXPLORE ]
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedConnections.map((user: any) => (
                <div
                  key={user.id}
                  className="border border-borderSubtle bg-surfaceElevated p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accentLime/20 text-accentLime flex items-center justify-center font-mono text-xs font-bold">
                      {user.profile?.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">
                        {user.profile?.fullName}
                      </h4>
                      <p className="font-mono text-[10px] text-textMuted">
                        Sem {user.profile?.semester} · {user.profile?.course.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectQuick(user.id)}
                    className="border border-borderLight px-2.5 py-1 font-mono text-[11px] text-accentLime hover:border-accentLime"
                  >
                    [ CONNECT ]
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
