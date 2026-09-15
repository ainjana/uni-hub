'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Zap,
  Search,
  UserPlus,
  Check,
  X,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export default function ConnectionsPage() {
  const [tab, setTab] = useState<'discover' | 'connected' | 'pending'>('discover');
  const [students, setStudents] = useState<any[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (tab === 'discover') {
        const res = await fetch('/api/connections');
        if (res.ok) {
          const json = await res.json();
          setStudents(json.students || []);
        }
      } else if (tab === 'connected') {
        const res = await fetch('/api/connections?filter=connected');
        if (res.ok) {
          const json = await res.json();
          setConnectedPeers(json.peers || []);
        }
      } else if (tab === 'pending') {
        const res = await fetch('/api/connections?filter=pending');
        if (res.ok) {
          const json = await res.json();
          setPendingReceived(json.received || []);
          setPendingSent(json.sent || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        setActionNotice('Connection request sent!');
        fetchData();
      }
    } catch {
      alert('Error sending request');
    }
  };

  const handleRespond = async (connectionId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });
      if (res.ok) {
        setActionNotice(action === 'ACCEPT' ? 'Connected successfully!' : 'Request declined');
        fetchData();
      }
    } catch {
      alert('Error processing connection');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ VERIFIED COLLEGIATE NETWORK ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              STUDENT CONNECTIONS & COLLABORATORS
            </h1>
            <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
              Discover students with complementary technical skills across top universities. Connect to coordinate study sessions, build hackathon projects, and share academic knowledge.
            </p>
          </div>
        </div>

        {actionNotice && (
          <div className="border border-accentLime bg-accentLime/10 p-3 font-mono text-xs text-accentLime flex justify-between items-center">
            <span>[ {actionNotice} ]</span>
            <button onClick={() => setActionNotice('')} className="text-textMuted hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="border border-borderSubtle bg-surface p-4 flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => setTab('discover')}
            className={`px-4 py-2 uppercase ${
              tab === 'discover'
                ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            [ 01 / DISCOVER PEERS ]
          </button>
          <button
            onClick={() => setTab('connected')}
            className={`px-4 py-2 uppercase ${
              tab === 'connected'
                ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            [ 02 / CONNECTED NETWORK ]
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 uppercase ${
              tab === 'pending'
                ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            [ 03 / PENDING REQUESTS ({pendingReceived.length}) ]
          </button>
        </div>

        {/* Discover Peers Tab */}
        {tab === 'discover' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="py-20 text-center font-mono text-xs text-accentLime">
                [ SCANNING COLLEGIATE DIRECTORY... ]
              </div>
            ) : students.length === 0 ? (
              <div className="border border-dashed border-borderLight bg-surface p-12 text-center font-mono text-xs text-textMuted">
                No students found in current directory.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((s) => {
                  const prof = s.profile;
                  const relationship = s.relationship;

                  return (
                    <div
                      key={s.id}
                      className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-borderLight transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-accentLime/20 text-accentLime font-mono text-base font-bold flex items-center justify-center shrink-0">
                            {prof?.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-sans text-base font-bold text-textPrimary">
                                {prof?.fullName}
                              </h3>
                              <ShieldCheck className="h-3.5 w-3.5 text-accentLime" />
                            </div>
                            <p className="font-mono text-xs text-textMuted">
                              {s.college?.name}
                            </p>
                            <p className="font-mono text-[11px] text-accentLime">
                              {prof?.course} · Sem {prof?.semester}
                            </p>
                          </div>
                        </div>

                        {prof?.bio && (
                          <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed">
                            {prof.bio}
                          </p>
                        )}

                        {/* Skills chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {prof?.skills?.slice(0, 3).map((sk: any) => (
                            <span
                              key={sk.id}
                              className="border border-borderSubtle bg-surfaceElevated px-2 py-0.5 font-mono text-[10px] text-textMuted"
                            >
                              {sk.skill?.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="mt-6 pt-4 border-t border-borderSubtle flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-1 text-textMuted">
                          <Zap className="h-3 w-3 fill-accentLime text-accentLime" />
                          <span>{prof?.totalKarma} Karma</span>
                        </div>

                        {relationship === 'CONNECTED' ? (
                          <span className="text-accentLime font-bold">[ CONNECTED ]</span>
                        ) : relationship === 'REQUEST_SENT' ? (
                          <span className="text-textMuted">[ REQUEST PENDING ]</span>
                        ) : relationship === 'REQUEST_RECEIVED' ? (
                          <Link
                            href="/connections"
                            onClick={() => setTab('pending')}
                            className="text-accentLime hover:underline"
                          >
                            [ RESPOND ]
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(s.id)}
                            className="border border-borderLight bg-surfaceElevated px-3 py-1 text-accentLime hover:border-accentLime"
                          >
                            [ CONNECT ]
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Connected Network Tab */}
        {tab === 'connected' && (
          <div className="space-y-6">
            {connectedPeers.length === 0 ? (
              <div className="border border-dashed border-borderLight bg-surface p-12 text-center font-mono text-xs text-textMuted">
                You haven't established connections yet. Browse students in the Discover tab!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedPeers.map((c) => (
                  <div
                    key={c.connectionId}
                    className="border border-borderSubtle bg-surface p-6 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accentLime/20 text-accentLime font-mono text-sm font-bold flex items-center justify-center">
                        {c.student?.profile?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-textPrimary">
                          {c.student?.profile?.fullName}
                        </h4>
                        <p className="font-mono text-xs text-textMuted">
                          {c.student?.college?.name}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/chat"
                      className="border border-borderLight bg-surfaceElevated p-2 text-accentLime hover:border-accentLime"
                      title="Direct message"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {tab === 'pending' && (
          <div className="space-y-6 font-mono text-xs">
            <div>
              <h3 className="uppercase text-accentLime font-bold mb-3">
                [ RECEIVED REQUESTS ({pendingReceived.length}) ]
              </h3>
              {pendingReceived.length === 0 ? (
                <p className="text-textMuted">No pending requests received.</p>
              ) : (
                <div className="space-y-3">
                  {pendingReceived.map((req) => (
                    <div
                      key={req.connectionId}
                      className="border border-borderSubtle bg-surface p-4 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-textPrimary">
                          {req.student?.profile?.fullName}
                        </span>
                        <span className="text-textMuted ml-2">
                          [{req.student?.college?.name} · {req.student?.profile?.course}]
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(req.connectionId, 'ACCEPT')}
                          className="border border-accentLime bg-accentLime/10 px-3 py-1 text-accentLime hover:bg-accentLime hover:text-background"
                        >
                          [ ACCEPT ]
                        </button>
                        <button
                          onClick={() => handleRespond(req.connectionId, 'DECLINE')}
                          className="border border-borderSubtle px-3 py-1 text-textMuted hover:text-white"
                        >
                          [ DECLINE ]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-borderSubtle">
              <h3 className="uppercase text-textMuted font-bold mb-3">
                [ SENT REQUESTS AWAITING RESPONSE ({pendingSent.length}) ]
              </h3>
              {pendingSent.length === 0 ? (
                <p className="text-textMuted">No sent pending requests.</p>
              ) : (
                <div className="space-y-2">
                  {pendingSent.map((req) => (
                    <div
                      key={req.connectionId}
                      className="border border-borderSubtle bg-surface p-3 flex justify-between items-center text-textMuted"
                    >
                      <span>To: {req.student?.profile?.fullName} ({req.student?.college?.name})</span>
                      <span className="text-accentLime">[ AWAITING CONFIRMATION ]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
